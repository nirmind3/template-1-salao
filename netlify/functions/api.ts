import { db, verifyPassword } from '../../server/db';

interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export async function handler(event: NetlifyEvent) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  }

  // Normalize path
  let reqPath = event.path;
  if (reqPath.includes('/.netlify/functions/api')) {
    reqPath = reqPath.replace('/.netlify/functions/api', '/api');
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    // Health check
    if (reqPath === '/api/health' || reqPath === '/api/health/') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'ok', netlify: true }),
      };
    }

    // Public data
    if (reqPath === '/api/data' || reqPath === '/api/data/') {
      const data = db.getStoredData();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // Login
    if (reqPath === '/api/auth/login' && event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { username, password } = body;
      if (!username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Usuário e senha são obrigatórios' }),
        };
      }

      const user = db.getUserByUsername(String(username));
      if (!user || !verifyPassword(String(password), user.passwordHash, user.salt)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Usuário ou senha incorretos' }),
        };
      }

      const sessionToken = db.createSession(user.id, user.username);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, token: sessionToken, username: user.username }),
      };
    }

    // Verify session
    if (reqPath === '/api/auth/verify' && event.httpMethod === 'GET') {
      const verification = db.verifySession(token);
      if (!verification.valid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ valid: false, error: 'Sessão inválida ou expirada' }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: true, username: verification.username }),
      };
    }

    // Logout
    if (reqPath === '/api/auth/logout' && event.httpMethod === 'POST') {
      if (token) {
        db.revokeSession(token);
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // Change Password
    if (reqPath === '/api/auth/change-password' && event.httpMethod === 'POST') {
      const verification = db.verifySession(token);
      if (!verification.valid || !verification.userId) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Não autorizado.' }),
        };
      }

      const body = event.body ? JSON.parse(event.body) : {};
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Preencha senha atual e nova senha.' }),
        };
      }

      const user = db.getUserByUsername(verification.username || '');
      if (!user || !verifyPassword(String(currentPassword), user.passwordHash, user.salt)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Senha atual incorreta.' }),
        };
      }

      db.updatePassword(user.id, String(newPassword));
      const newToken = db.createSession(user.id, user.username);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Senha alterada com sucesso!', token: newToken }),
      };
    }

    // Save Data
    if (reqPath === '/api/admin/save-data' && event.httpMethod === 'POST') {
      const verification = db.verifySession(token);
      if (!verification.valid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Não autorizado' }),
        };
      }

      const body = event.body ? JSON.parse(event.body) : {};
      db.saveStoredData(body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint não encontrado' }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro no servidor Netlify Function: ' + err.message }),
    };
  }
}
