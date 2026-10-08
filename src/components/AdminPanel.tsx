import React, { useState } from 'react';
import { HaircutItem, SalonConfig, AdminStats } from '../types';
import { formatBRL, generateWhatsAppMessage } from '../utils/whatsapp';
import { authApi } from '../services/authApi';
import { ImageUploadInput } from './ImageUploadInput';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Settings,
  Phone,
  BarChart3,
  Scissors,
  Save,
  MessageCircle,
  ExternalLink,
  Tag,
  AlertTriangle,
  Copy,
  Key,
  LogOut,
  ShieldCheck,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  haircuts: HaircutItem[];
  salonConfig: SalonConfig;
  stats: AdminStats;
  onUpdateHaircuts: (haircuts: HaircutItem[]) => void;
  onUpdateSalonConfig: (config: SalonConfig) => void;
  onResetDefaults: () => void;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  haircuts,
  salonConfig,
  stats,
  onUpdateHaircuts,
  onUpdateSalonConfig,
  onResetDefaults,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'cortes' | 'whatsapp' | 'salao' | 'metricas' | 'seguranca'>('cortes');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Local state for editing salon config
  const [configForm, setConfigForm] = useState<SalonConfig>({ ...salonConfig });
  const [configSaved, setConfigSaved] = useState(false);

  // Local state for editing or creating haircut
  const [editingItem, setEditingItem] = useState<HaircutItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New haircut template
  const [newItemForm, setNewItemForm] = useState<Partial<HaircutItem>>({
    title: '',
    subtitle: '',
    category: 'feminino',
    price: 80,
    durationMinutes: 45,
    description: '',
    ingredientsOrTechnique: '',
    badge: '',
    imageUrl: '',
    available: true,
    recommendedAlterations: ['Manter comprimento', 'Diminuir volume'],
  });

  const [quickAlterationsInput, setQuickAlterationsInput] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  const sampleOrderMessage = generateWhatsAppMessage({
    haircut: haircuts[0] || {
      id: 'corte-camadas',
      title: 'Corte em Camadas Assinatura (Longo com Movimento)',
      category: 'assinatura',
      price: 130,
      durationMinutes: 60,
      description: '',
      available: true,
      imageUrl: '',
    },
    salonConfig: configForm,
    alteration: 'Manter o comprimento e tirar pontas',
    selectedAddOns: [],
    clientName: 'Maria Silva (Exemplo)',
    preferredDay: 'Sábado',
    preferredShift: 'Tarde',
    customNotes: 'Cabelo ondulado, prefiro secagem natural',
  });

  const handleCopyAdminSummary = () => {
    navigator.clipboard.writeText(sampleOrderMessage);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSalonConfig(configForm);
    authApi.syncWithDatabase({ salonConfig: configForm });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: 'error', message: 'Preencha todos os campos de senha.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus(null);
    const result = await authApi.changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);

    if (result.success) {
      setPasswordStatus({ type: 'success', message: result.message || 'Senha atualizada com sucesso no banco de dados!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ type: 'error', message: result.error || 'Erro ao alterar senha.' });
    }
  };

  const handleToggleAvailability = (id: string) => {
    const updated = haircuts.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    onUpdateHaircuts(updated);
    authApi.syncWithDatabase({ haircuts: updated });
  };

  const handleDeleteCut = (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja remover o corte "${title}" do cardápio?`)) {
      const updated = haircuts.filter(item => item.id !== id);
      onUpdateHaircuts(updated);
      authApi.syncWithDatabase({ haircuts: updated });
    }
  };

  const handleSaveHaircut = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated = haircuts.map(item => item.id === editingItem.id ? editingItem : item);
      onUpdateHaircuts(updated);
      authApi.syncWithDatabase({ haircuts: updated });
      setEditingItem(null);
    }
  };

  const handleCreateNewHaircut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.title || !newItemForm.price) return;

    const alts = quickAlterationsInput
      ? quickAlterationsInput.split(',').map(s => s.trim()).filter(Boolean)
      : ['Manter comprimento', 'Diminuir volume'];

    const newCut: HaircutItem = {
      id: `cut-${Date.now()}`,
      title: newItemForm.title || 'Novo Corte',
      subtitle: newItemForm.subtitle || '',
      category: newItemForm.category || 'feminino',
      price: Number(newItemForm.price) || 50,
      originalPrice: newItemForm.originalPrice ? Number(newItemForm.originalPrice) : undefined,
      durationMinutes: Number(newItemForm.durationMinutes) || 45,
      description: newItemForm.description || 'Descrição personalizada do corte.',
      ingredientsOrTechnique: newItemForm.ingredientsOrTechnique || 'Técnica e finalização profissional.',
      badge: newItemForm.badge || '',
      imageUrl: newItemForm.imageUrl || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
      available: true,
      recommendedAlterations: alts,
    };

    onUpdateHaircuts([newCut, ...haircuts]);
    setIsCreatingNew(false);
    setNewItemForm({
      title: '',
      subtitle: '',
      category: 'feminino',
      price: 80,
      durationMinutes: 45,
      description: '',
      ingredientsOrTechnique: '',
      badge: '',
      imageUrl: '',
      available: true,
    });
    setQuickAlterationsInput('');
  };

  const handleQuickPriceChange = (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    const updated = haircuts.map(item =>
      item.id === id ? { ...item, price: newPrice } : item
    );
    onUpdateHaircuts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        id="admin-panel-container"
        className="relative w-full max-w-4xl bg-[#141312] rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-neutral-100"
      >
        {/* Header */}
        <div className="bg-[#1C1A17] text-white p-5 sm:p-6 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-neutral-950 shadow-md font-bold">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif-luxury text-white">
                  Painel Administrativo
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-amber-500/30">
                  Gerenciador
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Altere preços hipotéticos, adicione novos cortes e configure o WhatsApp do salão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-[11px] text-amber-300 border border-neutral-700">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin: {authApi.getUsername()}</span>
            </div>

            {onLogout && (
              <button
                id="admin-logout-btn"
                onClick={onLogout}
                title="Encerrar sessão de administrador"
                className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-xl border border-neutral-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}

            <button
              id="close-admin-panel"
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Fechar painel de administração"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#181716] border-b border-neutral-800 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            id="admin-tab-cortes"
            onClick={() => setActiveTab('cortes')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cortes'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-amber-300'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Cardápio de Cortes ({haircuts.length})</span>
          </button>

          <button
            id="admin-tab-whatsapp"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-amber-300'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Configurar WhatsApp</span>
          </button>

          <button
            id="admin-tab-salao"
            onClick={() => setActiveTab('salao')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'salao'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-amber-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Dados do Salão & Banner</span>
          </button>

          <button
            id="admin-tab-metricas"
            onClick={() => setActiveTab('metricas')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'metricas'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-amber-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas & Pedidos ({stats.totalClicksWhatsApp})</span>
          </button>

          <button
            id="admin-tab-seguranca"
            onClick={() => setActiveTab('seguranca')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seguranca'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-amber-300'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Segurança & Senha</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto grow">

          {/* ================= TAB 1: CORTES & CARDÁPIO ================= */}
          {activeTab === 'cortes' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#181716] p-4 rounded-2xl border border-neutral-800">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Gerenciar Itens do Cardápio
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Você pode alterar os preços hipotéticos a qualquer momento, desativar cortes esgotados ou adicionar novidades.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-add-new-cut"
                    onClick={() => {
                      setIsCreatingNew(true);
                      setEditingItem(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-amber-950/40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 font-bold" />
                    <span>Adicionar Novo Corte</span>
                  </button>
                </div>
              </div>

              {/* Form to Add New Cut */}
              {isCreatingNew && (
                <form
                  onSubmit={handleCreateNewHaircut}
                  className="bg-[#181716] p-5 rounded-2xl border border-amber-500/40 shadow-xl space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      Cadastrar Novo Corte no Cardápio
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Nome do Corte:
                      </label>
                      <input
                        type="text"
                        required
                        value={newItemForm.title}
                        onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                        placeholder="Ex: Corte Long Bob Desfiado"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Categoria:
                      </label>
                      <select
                        value={newItemForm.category}
                        onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                      >
                        <option value="feminino">Feminino</option>
                        <option value="masculino">Masculino</option>
                        <option value="assinatura">Especialidade da Casa</option>
                        <option value="combos">Combo & Harmonização</option>
                        <option value="coloracao">Coloração & Mechas</option>
                        <option value="tratamentos">Tratamentos & Spa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Preço Hipotético (R$):
                      </label>
                      <input
                        type="number"
                        required
                        value={newItemForm.price}
                        onChange={(e) => setNewItemForm({ ...newItemForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Duração Estimada (min):
                      </label>
                      <input
                        type="number"
                        value={newItemForm.durationMinutes}
                        onChange={(e) => setNewItemForm({ ...newItemForm, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Selo / Badge (opcional):
                      </label>
                      <input
                        type="text"
                        value={newItemForm.badge}
                        onChange={(e) => setNewItemForm({ ...newItemForm, badge: e.target.value })}
                        placeholder="Ex: Novo, Destaque da Semana"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Descrição do Estilo:
                    </label>
                    <textarea
                      rows={2}
                      value={newItemForm.description}
                      onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                      placeholder="Descreva o caimento, textura e proposta do corte..."
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Técnica / Ingredientes Usados:
                      </label>
                      <input
                        type="text"
                        value={newItemForm.ingredientsOrTechnique}
                        onChange={(e) => setNewItemForm({ ...newItemForm, ingredientsOrTechnique: e.target.value })}
                        placeholder="Ex: Tesoura dentada + finalizador com óleo de argan"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Alterações Sugeridas (separadas por vírgula):
                      </label>
                      <input
                        type="text"
                        value={quickAlterationsInput}
                        onChange={(e) => setQuickAlterationsInput(e.target.value)}
                        placeholder="Ex: Franja leve, Tirar volume, Manter pontas"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500"
                      />
                    </div>
                  </div>

                  <ImageUploadInput
                    label="Foto do Corte (Suba do Computador ou Link):"
                    value={newItemForm.imageUrl || ''}
                    onChange={(newUrl) => setNewItemForm({ ...newItemForm, imageUrl: newUrl })}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-4 py-2 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 rounded-lg text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 rounded-lg text-xs font-bold cursor-pointer shadow-md shadow-amber-950/40"
                    >
                      Salvar Corte no Cardápio
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Modal / Form if editing an existing cut */}
              {editingItem && (
                <form
                  onSubmit={handleSaveHaircut}
                  className="bg-[#181716] p-5 rounded-2xl border border-amber-500/50 shadow-xl space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-amber-400" />
                      Editar Corte: {editingItem.title}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Nome do Corte:
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Categoria:
                      </label>
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                      >
                        <option value="feminino">Feminino</option>
                        <option value="masculino">Masculino</option>
                        <option value="assinatura">Especialidade da Casa</option>
                        <option value="combos">Combo & Harmonização</option>
                        <option value="coloracao">Coloração & Mechas</option>
                        <option value="tratamentos">Tratamentos & Spa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Preço Hipotético (R$):
                      </label>
                      <input
                        type="number"
                        required
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono font-bold text-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Preço De/Por (R$):
                      </label>
                      <input
                        type="number"
                        value={editingItem.originalPrice || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Ex: 150"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Duração (min):
                      </label>
                      <input
                        type="number"
                        value={editingItem.durationMinutes}
                        onChange={(e) => setEditingItem({ ...editingItem, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Descrição:
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                    />
                  </div>

                  <ImageUploadInput
                    label="Alterar Foto do Corte (Suba do Computador ou Link):"
                    value={editingItem.imageUrl || ''}
                    onChange={(newUrl) => setEditingItem({ ...editingItem, imageUrl: newUrl })}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 rounded-lg text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 rounded-lg text-xs font-bold cursor-pointer shadow-md shadow-amber-950/40"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              )}

              {/* List of Cuts Table / Cards */}
              <div className="space-y-2.5">
                {haircuts.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      item.available
                        ? 'bg-[#181716] border-neutral-800 hover:border-amber-400/40'
                        : 'bg-neutral-900/60 border-neutral-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-800"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] bg-neutral-900 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-semibold">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                            ({item.category})
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Quick Price input & actions */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-neutral-400">Preço:</span>
                        <div className="flex items-center border border-amber-500/30 rounded-lg px-2 py-1 bg-neutral-900">
                          <span className="text-xs font-bold text-amber-400 mr-1">R$</span>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleQuickPriceChange(item.id, Number(e.target.value))}
                            className="w-14 text-xs font-bold font-mono text-white focus:outline-hidden bg-transparent"
                            title="Editar preço rapidamente"
                          />
                        </div>
                      </div>

                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                          item.available
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        {item.available ? 'Ativo' : 'Inativo'}
                      </button>

                      {/* Edit full details */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem({ ...item });
                          setIsCreatingNew(false);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar todos os detalhes"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCut(item.id, item.title)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir corte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: WHATSAPP CONFIG ================= */}
          {activeTab === 'whatsapp' && (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-800 rounded-2xl p-4 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-200 leading-relaxed">
                  <strong className="text-emerald-300">Como funciona o redirecionamento:</strong>
                  <p className="mt-1 text-emerald-200/90">
                    Quando a cliente seleciona o corte no cardápio e especifica a alteração (ex: "Manter comprimento e tirar pontas"), o sistema gera automaticamente a mensagem formatada e abre o WhatsApp do número configurado abaixo!
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-200 mb-1">
                    Número de WhatsApp para Receber os Pedidos:
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Coloque com código do país e DDD, só números (ex: 5511987654321).
                  </p>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={configForm.whatsappNumber}
                      onChange={(e) => setConfigForm({ ...configForm, whatsappNumber: e.target.value })}
                      placeholder="Ex: 5511998765432"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-mono font-semibold text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-200 mb-1">
                    Mensagem Padrão de Boas-Vindas / Contato Rápido:
                  </label>
                  <textarea
                    rows={3}
                    value={configForm.welcomeMessageTemplate}
                    onChange={(e) => setConfigForm({ ...configForm, welcomeMessageTemplate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400 focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Resumo do Pedido (será enviado no WhatsApp) - Exclusivo do Admin */}
                <div className="bg-[#181716] border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Resumo do Pedido (será enviado no WhatsApp):</span>
                    </label>
                    <span className="text-[10px] bg-neutral-800 text-amber-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/30">
                      Apenas no Admin
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Edite o texto de introdução/saudação enviado quando a cliente clica em "Fazer Pedido" no cardápio:
                  </p>
                  <textarea
                    rows={2}
                    value={configForm.orderMessageTemplate || ''}
                    onChange={(e) => setConfigForm({ ...configForm, orderMessageTemplate: e.target.value })}
                    placeholder="Olá!\nGostaria de solicitar um agendamento pelo cardápio de cortes."
                    className="w-full px-3.5 py-2 border border-neutral-700 rounded-xl text-xs bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400 focus:outline-hidden leading-relaxed font-mono"
                  />

                  {/* Pré-visualização do resumo completo */}
                  <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Pré-visualização do Pedido Completo:
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAdminSummary}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSummary ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">
                      {sampleOrderMessage}
                    </pre>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  {/* Test link button - verde obrigatório */}
                  <a
                    href={`https://wa.me/${configForm.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Teste de conexão do cardápio de cortes.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white hover:bg-emerald-500 font-semibold bg-emerald-600 px-3.5 py-2 rounded-xl shadow-md shadow-emerald-950/40 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar no WhatsApp Agora</span>
                  </a>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-neutral-950 text-xs font-bold rounded-xl shadow-md shadow-amber-950/40 transition-all cursor-pointer"
                  >
                    {configSaved ? (
                      <>
                        <Check className="w-4 h-4 text-neutral-950 font-bold" />
                        <span>Salvo com Sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Número</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 3: DADOS DO SALÃO & BANNER ================= */}
          {activeTab === 'salao' && (
            <div className="max-w-xl mx-auto space-y-4">
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-1">
                      Nome do Salão:
                    </label>
                    <input
                      type="text"
                      value={configForm.salonName}
                      onChange={(e) => setConfigForm({ ...configForm, salonName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-1">
                      Instagram:
                    </label>
                    <input
                      type="text"
                      value={configForm.instagramHandle}
                      onChange={(e) => setConfigForm({ ...configForm, instagramHandle: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-200 mb-1">
                    Slogan / Subtítulo:
                  </label>
                  <input
                    type="text"
                    value={configForm.tagline}
                    onChange={(e) => setConfigForm({ ...configForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-1">
                      Endereço Completo:
                    </label>
                    <input
                      type="text"
                      value={configForm.address}
                      onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-1">
                      Bairro & Cidade:
                    </label>
                    <input
                      type="text"
                      value={configForm.neighborhoodCity}
                      onChange={(e) => setConfigForm({ ...configForm, neighborhoodCity: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-200 mb-1">
                    Horário de Funcionamento:
                  </label>
                  <input
                    type="text"
                    value={configForm.openingHours}
                    onChange={(e) => setConfigForm({ ...configForm, openingHours: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                {/* Promo banner settings */}
                <div className="bg-[#181716] p-3.5 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      Banner Promocional no Topo:
                    </label>
                    <input
                      type="checkbox"
                      checked={configForm.showPromoBanner}
                      onChange={(e) => setConfigForm({ ...configForm, showPromoBanner: e.target.checked })}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={configForm.announcementText}
                    onChange={(e) => setConfigForm({ ...configForm, announcementText: e.target.value })}
                    placeholder="Ex: 10% de desconto para novos clientes às terças-feiras!"
                    className="w-full px-3 py-2 border border-neutral-700 rounded-xl text-xs bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-neutral-950 text-xs font-bold rounded-xl shadow-md shadow-amber-950/40 transition-all cursor-pointer"
                  >
                    {configSaved ? (
                      <>
                        <Check className="w-4 h-4 text-neutral-950 font-bold" />
                        <span>Configurações Salvas!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Informações</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 4: MÉTRICAS & PEDIDOS ================= */}
          {activeTab === 'metricas' && (
            <div className="space-y-6">
              {/* Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#181716] p-4 rounded-2xl border border-emerald-800/60 shadow-md">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    Agendamentos no WhatsApp
                  </span>
                  <span className="text-3xl font-bold font-mono text-emerald-400 mt-1 block">
                    {stats.totalClicksWhatsApp}
                  </span>
                  <span className="text-[11px] text-emerald-300/80 mt-1 block">
                    redirecionamentos efetuados
                  </span>
                </div>

                <div className="bg-[#181716] p-4 rounded-2xl border border-neutral-800 shadow-md">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    Cortes no Cardápio
                  </span>
                  <span className="text-3xl font-bold font-mono text-white mt-1 block">
                    {haircuts.length}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    {haircuts.filter(h => h.available).length} ativos para pedidos
                  </span>
                </div>

                <div className="bg-[#181716] p-4 rounded-2xl border border-neutral-800 shadow-md">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    Ticket Médio Hipotético
                  </span>
                  <span className="text-3xl font-bold font-mono text-amber-400 mt-1 block">
                    {formatBRL(
                      haircuts.length > 0
                        ? haircuts.reduce((acc, h) => acc + h.price, 0) / haircuts.length
                        : 0
                    )}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    média geral do cardápio
                  </span>
                </div>
              </div>

              {/* Recent Orders Log */}
              <div>
                <h4 className="font-bold text-white text-sm mb-2.5">
                  Últimos Pedidos Gerados pelo Cardápio:
                </h4>
                {stats.recentLeads && stats.recentLeads.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {stats.recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-[#181716] p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {lead.clientName || 'Cliente Visitante'}
                            </span>
                            <span className="text-amber-400 font-semibold">
                              → {lead.haircutTitle}
                            </span>
                          </div>
                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            Alteração: {lead.alteration} • Dia: {lead.preferredDay || 'A combinar'} ({lead.preferredShift})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold font-mono text-amber-400">
                            {formatBRL(lead.totalPrice)}
                          </span>
                          <span className="text-[10px] text-neutral-500 block">
                            {lead.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#181716] p-6 rounded-2xl border border-neutral-800 text-center text-xs text-neutral-400">
                    Nenhum pedido recente registrado ainda. Clique em "Fazer Pedido" em qualquer corte do cardápio para testar!
                  </div>
                )}
              </div>

              {/* Reset to Factory Defaults */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Deseja resetar todos os cortes e dados para o padrão original?</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza? Isso restaurará o cardápio e preços originais.')) {
                      onResetDefaults();
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-800/80 text-red-400 hover:bg-red-950/40 text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Cardápio Padrão</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 5: SEGURANÇA & SENHA DO BANCO ================= */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-[#181716] border border-amber-500/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm mb-1">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Proteção do Banco de Dados</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  As credenciais de acesso ao painel ficam armazenadas de forma criptografada no banco de dados (hash com algoritmo seguro e salt exclusivo). Nenhuma senha ou token de autenticação fica exposta no código front-end.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-700 font-semibold text-neutral-200">
                    Usuário atual: <strong className="text-amber-300">{authApi.getUsername()}</strong>
                  </span>
                  <span className="bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-700 text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sessão criptografada ativa
                  </span>
                </div>
              </div>

              {/* Formulário de alteração de senha */}
              <div className="bg-[#181716] border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-md">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Alterar Senha do Administrador</span>
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  A nova senha será salva diretamente no banco de dados e criptografada com salt seguro.
                </p>

                {passwordStatus && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                      passwordStatus.type === 'success'
                        ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                        : 'bg-red-950/70 border border-red-800 text-red-300'
                    }`}
                  >
                    {passwordStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{passwordStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-1">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-200 mb-1">
                        Nova Senha (mínimo 6 dígitos)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-200 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      *Você permanecerá logado após a alteração.
                    </span>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 rounded-xl text-sm font-bold shadow-md shadow-amber-950/40 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 font-bold" />
                      <span>{isChangingPassword ? 'Salvando no Banco...' : 'Salvar Nova Senha'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Informações de Deploy no Netlify */}
              <div className="bg-[#181716] text-neutral-200 rounded-2xl p-5 border border-neutral-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Preparado para Netlify</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                  O projeto já possui os arquivos <code className="text-amber-300 font-mono">netlify.toml</code>, <code className="text-amber-300 font-mono">public/_redirects</code> e <code className="text-amber-300 font-mono">netlify/functions/api.ts</code> configurados para publicação direta no Netlify sem falhas de rotas (SPA) ou de autenticação.
                </p>
                <div className="text-[11px] text-neutral-400 space-y-1 bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono">
                  <div>• Comando de build: npm run build</div>
                  <div>• Diretório de publicação: dist</div>
                  <div>• Funções serverless: netlify/functions</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#100F0E] border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span>{salonConfig.salonName} • Sistema de Gestão do Cardápio</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold cursor-pointer transition-colors"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
