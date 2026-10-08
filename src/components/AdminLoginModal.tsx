import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, X, Loader2 } from 'lucide-react';
import { authApi } from '../services/authApi';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Por favor, informe seu usuário e senha.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await authApi.login(username.trim(), password);
    setIsLoading(false);

    if (result.success && result.token) {
      onLoginSuccess(result.username || username.trim());
      onClose();
      setUsername('');
      setPassword('');
    } else {
      setErrorMessage(result.error || 'Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        id="admin-login-modal"
        className="relative w-full max-w-md bg-[#141312] rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-neutral-100"
      >
        {/* Modal Header */}
        <div className="bg-[#1C1A17] text-white px-6 py-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-neutral-950 shadow-md">
              <Lock className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-white">
                Acesso Administrativo
              </h2>
              <p className="text-xs text-neutral-400">
                Painel de Controle
              </p>
            </div>
          </div>

          <button
            id="close-login-modal"
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar modal de login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-300 block">
                Autenticação Segura no Banco de Dados
              </span>
              Nenhuma senha ou token fica exposta no front-end. As credenciais são criptografadas e validadas diretamente no servidor.
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-200 mb-1.5 uppercase tracking-wider">
              Usuário Administrador
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-neutral-900/90 transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-200 mb-1.5 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-neutral-900/90 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200 cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 rounded-xl border border-neutral-700 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-98 text-neutral-950 text-sm font-bold shadow-md shadow-amber-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-neutral-950" />
                  <span>Entrar no Painel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
