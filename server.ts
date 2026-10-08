import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, verifyPassword } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API Routes (mounted BEFORE Vite/static handlers)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Public data endpoint (returns custom data stored in DB if any)
  app.get('/api/data', (_req, res) => {
    try {
      const data = db.getStoredData();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao carregar dados do banco' });
    }
  });

  // Admin Login: Authenticates user against hashed credentials in database
  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }

      const user = db.getUserByUsername(String(username));
      if (!user) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' });
      }

      const isValid = verifyPassword(String(password), user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' });
      }

      // Generate cryptographically secure session token
      const token = db.createSession(user.id, user.username);
      return res.json({
        success: true,
        token,
        username: user.username,
      });
    } catch (e: any) {
      console.error('Login error:', e);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });

  // Verify Session Token
  app.get('/api/auth/verify', (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

      const verification = db.verifySession(token);
      if (!verification.valid) {
        return res.status(401).json({ valid: false, error: 'Sessão inválida ou expirada' });
      }

      return res.json({ valid: true, username: verification.username });
    } catch (e: any) {
      return res.status(500).json({ valid: false, error: 'Erro ao verificar sessão' });
    }
  });

  // Admin Logout
  app.post('/api/auth/logout', (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      if (token) {
        db.revokeSession(token);
      }
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: 'Erro ao encerrar sessão' });
    }
  });

  // Change Admin Password (Authenticated)
  app.post('/api/auth/change-password', (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      const verification = db.verifySession(token);

      if (!verification.valid || !verification.userId) {
        return res.status(401).json({ error: 'Não autorizado. Faça login novamente.' });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }

      const user = db.getUserByUsername(verification.username || '');
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const isCurrentValid = verifyPassword(String(currentPassword), user.passwordHash, user.salt);
      if (!isCurrentValid) {
        return res.status(400).json({ error: 'A senha atual informada está incorreta.' });
      }

      const updated = db.updatePassword(user.id, String(newPassword));
      if (!updated) {
        return res.status(500).json({ error: 'Falha ao atualizar senha.' });
      }

      // Create new session token since previous was revoked
      const newToken = db.createSession(user.id, user.username);
      return res.json({
        success: true,
        message: 'Senha alterada com sucesso!',
        token: newToken,
      });
    } catch (e: any) {
      console.error('Password change error:', e);
      return res.status(500).json({ error: 'Erro interno ao alterar senha.' });
    }
  });

  // Save Salon Data into Database (Authenticated)
  app.post('/api/admin/save-data', (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      const verification = db.verifySession(token);

      if (!verification.valid) {
        return res.status(401).json({ error: 'Não autorizado. Faça login.' });
      }

      db.saveStoredData(req.body);
      return res.json({ success: true, message: 'Dados salvos no banco de dados com sucesso.' });
    } catch (e: any) {
      console.error('Save data error:', e);
      return res.status(500).json({ error: 'Erro ao salvar dados no banco.' });
    }
  });

  // Vite middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
