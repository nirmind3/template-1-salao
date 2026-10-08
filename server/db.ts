import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  username: string;
  expiresAt: number;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  sessions: SessionRecord[];
  salonConfig?: any;
  haircuts?: any[];
  lastUpdated: string;
}

// Determine database file path (works in local dev, Docker, and Netlify /tmp)
function getDatabaseFilePath(): string {
  const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isServerless) {
    return path.join('/tmp', 'database.json');
  }
  return path.join(process.cwd(), 'data', 'database.json');
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const calculatedHash = crypto.scryptSync(password, salt, 64);
    const hashBuffer = Buffer.from(hash, 'hex');
    if (calculatedHash.length !== hashBuffer.length) return false;
    return crypto.timingSafeEqual(calculatedHash, hashBuffer);
  } catch {
    return false;
  }
}

class Database {
  private filePath: string;
  private memoryCache: DatabaseSchema | null = null;

  constructor() {
    this.filePath = getDatabaseFilePath();
    this.initialize();
  }

  private ensureDir() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (e) {
      console.warn('Could not create database directory:', e);
    }
  }

  private readData(): DatabaseSchema {
    try {
      this.ensureDir();
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryCache = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('Reading database from file failed, using memory cache', e);
    }

    if (this.memoryCache) {
      return this.memoryCache;
    }

    const initialData: DatabaseSchema = {
      users: [],
      sessions: [],
      lastUpdated: new Date().toISOString(),
    };
    this.memoryCache = initialData;
    return initialData;
  }

  private writeData(data: DatabaseSchema): void {
    data.lastUpdated = new Date().toISOString();
    this.memoryCache = data;
    try {
      this.ensureDir();
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to write database to disk, preserved in memory:', e);
    }
  }

  public initialize(): void {
    const data = this.readData();

    // Ensure initial admin user exists in the database
    const hasAdmin = data.users.some((u) => u.role === 'admin');
    if (!hasAdmin) {
      const defaultUser = process.env.ADMIN_INITIAL_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD;
      if (!defaultPassword) {
        console.warn('[Database] ADMIN_INITIAL_PASSWORD not set: initial admin user was NOT created. Define it in .env (local) or in the hosting environment variables.');
        return;
      }
      const { hash, salt } = hashPassword(defaultPassword);

      const adminUser: UserRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : 'admin-' + Date.now(),
        username: defaultUser.trim(),
        passwordHash: hash,
        salt: salt,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      data.users.push(adminUser);
      this.writeData(data);
      console.log(`[Database] Initial admin user "${adminUser.username}" created in database.`);
    }
  }

  public getUserByUsername(username: string): UserRecord | null {
    const data = this.readData();
    const clean = username.trim().toLowerCase();
    const user = data.users.find((u) => u.username.toLowerCase() === clean);
    return user || null;
  }

  public createSession(userId: string, username: string): string {
    const data = this.readData();
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours valid

    // Clean up expired sessions
    data.sessions = data.sessions.filter((s) => s.expiresAt > now);

    data.sessions.push({
      token,
      userId,
      username,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    this.writeData(data);
    return token;
  }

  public verifySession(token: string): { valid: boolean; username?: string; userId?: string } {
    if (!token) return { valid: false };
    const data = this.readData();
    const now = Date.now();

    const session = data.sessions.find((s) => s.token === token && s.expiresAt > now);
    if (!session) {
      return { valid: false };
    }

    return { valid: true, username: session.username, userId: session.userId };
  }

  public revokeSession(token: string): void {
    const data = this.readData();
    data.sessions = data.sessions.filter((s) => s.token !== token);
    this.writeData(data);
  }

  public updatePassword(userId: string, newPassword: string): boolean {
    const data = this.readData();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return false;

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.updatedAt = new Date().toISOString();

    // Revoke previous sessions on password change for security
    data.sessions = data.sessions.filter((s) => s.userId !== userId);

    this.writeData(data);
    return true;
  }

  public getStoredData(): { salonConfig: any; haircuts: any[] | null } {
    const data = this.readData();
    return {
      salonConfig: data.salonConfig || null,
      haircuts: data.haircuts || null,
    };
  }

  public saveStoredData(payload: { salonConfig?: any; haircuts?: any[] }): void {
    const data = this.readData();
    if (payload.salonConfig) {
      data.salonConfig = payload.salonConfig;
    }
    if (payload.haircuts) {
      data.haircuts = payload.haircuts;
    }
    this.writeData(data);
  }
}

export const db = new Database();
