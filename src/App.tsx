/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { HaircutItem, HaircutCategory, SalonConfig, AdminStats, BookingLead, AddOnOption, SortOption } from './types';
import { INITIAL_HAIRCUTS, INITIAL_SALON_CONFIG } from './data/initialData';
import { Navbar } from './components/Navbar';
import { MenuHero } from './components/MenuHero';
import { ClassicMenuCard } from './components/ClassicMenuCard';
import { PhotoMenuCard } from './components/PhotoMenuCard';
import { CatalogSidebar } from './components/CatalogSidebar';
import { BookingModal } from './components/BookingModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SalonFooter } from './components/SalonFooter';
import { authApi } from './services/authApi';
import { Check, MessageCircle, AlertCircle, Menu, LayoutGrid, BookOpen, ArrowUpDown } from 'lucide-react';

const STORAGE_KEY_HAIRCUTS = 'salao_haircuts_v3';
const STORAGE_KEY_CONFIG = 'salao_config_v3';
const STORAGE_KEY_STATS = 'salao_stats_v2';

const CATEGORY_NAMES: Record<HaircutCategory, string> = {
  todos: 'Todos os Cortes & Serviços',
  assinatura: 'Cortes Assinatura da Casa',
  feminino: 'Cortes Femininos',
  masculino: 'Cortes Masculinos',
  combos: 'Combos & Pacotes',
  coloracao: 'Coloração & Mechas',
  tratamentos: 'Tratamentos Capilares',
};

export default function App() {
  // 1. Haircuts state with localStorage persistence
  const [haircuts, setHaircuts] = useState<HaircutItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HAIRCUTS);
      if (saved) {
        const parsed: HaircutItem[] = JSON.parse(saved);
        // Filter out removed services: barboterapia, consultoria de visagismo + corte autoral, manicure/unhas
        const filtered = parsed.filter((item) => {
          const title = (item.title || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();
          if (item.id === 'combo-corte-barba' || title.includes('barboterapia') || desc.includes('barboterapia')) return false;
          if (item.id === 'visagismo-personalizado' || title.includes('visagismo') || title.includes('corte autoral')) return false;
          if (title.includes('manicure') || title.includes('unha') || desc.includes('manicure') || desc.includes('unha')) return false;
          return true;
        });

        return filtered.map((item) => {
          const fresh = INITIAL_HAIRCUTS.find((i) => i.id === item.id);
          const base = fresh ? { ...item, imageUrl: fresh.imageUrl } : item;
          const { originalPrice, ...clean } = base;
          return clean as HaircutItem;
        });
      }
    } catch (e) {
      console.error('Error loading saved haircuts', e);
    }
    return INITIAL_HAIRCUTS;
  });

  // 2. Salon Config state
  const [salonConfig, setSalonConfig] = useState<SalonConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SALON_CONFIG,
          ...parsed,
          showPromoBanner: false,
          announcementText: '',
          tagline: INITIAL_SALON_CONFIG.tagline,
        };
      }
    } catch (e) {
      console.error('Error loading saved config', e);
    }
    return INITIAL_SALON_CONFIG;
  });

  // 3. Admin & WhatsApp stats
  const [stats, setStats] = useState<AdminStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved stats', e);
    }
    return {
      totalClicksWhatsApp: 0,
      clicksPerHaircut: {},
      recentLeads: [],
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HAIRCUTS, JSON.stringify(haircuts));
    } catch (e) {
      console.error(e);
    }
  }, [haircuts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(salonConfig));
    } catch (e) {
      console.error(e);
    }
  }, [salonConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error(e);
    }
  }, [stats]);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<HaircutCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('destaques');
  const [viewMode, setViewMode] = useState<'classic' | 'grid'>('grid');
  const [selectedCutForBooking, setSelectedCutForBooking] = useState<HaircutItem | null>(null);
  const [initialAlteration, setInitialAlteration] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verify session and sync with server database on startup
  useEffect(() => {
    authApi.verifySession().then((res) => {
      setIsAdminAuthenticated(res.valid);
    }).catch(() => {
      setIsAdminAuthenticated(false);
    });

    authApi.fetchInitialData().then((serverData) => {
      if (serverData) {
        if (serverData.haircuts && Array.isArray(serverData.haircuts) && serverData.haircuts.length > 0) {
          setHaircuts(serverData.haircuts);
        }
        if (serverData.salonConfig && typeof serverData.salonConfig === 'object') {
          setSalonConfig((prev) => ({ ...prev, ...serverData.salonConfig }));
        }
      }
    }).catch(() => {});
  }, []);

  const handleOpenAdmin = async () => {
    const check = await authApi.verifySession();
    if (check.valid) {
      setIsAdminAuthenticated(true);
      setIsAdminOpen(true);
    } else {
      setIsAdminAuthenticated(false);
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (username: string) => {
    setIsAdminAuthenticated(true);
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
    showToast(`Bem-vindo, ${username}! Painel administrativo liberado.`);
  };

  const handleAdminLogout = async () => {
    await authApi.logout();
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
    showToast('Sessão administrativa encerrada.');
  };

  // Favorites state (Estilo Lavra & Linho)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('salao_favorites');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('salao_favorites', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      showToast(exists ? 'Removido dos favoritos' : 'Salvo nos favoritos!');
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter and sort haircuts based on category, search query, favorites, availability, and sort mode
  const filteredHaircuts = useMemo(() => {
    const list = haircuts.filter((item) => {
      // Must be active
      if (!item.available) return false;

      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(item.id)) return false;

      // Category filter
      if (!showOnlyFavorites && selectedCategory !== 'todos') {
        if (selectedCategory === 'assinatura' && item.category !== 'assinatura') return false;
        if (selectedCategory !== 'assinatura' && item.category !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTechnique = item.ingredientsOrTechnique?.toLowerCase().includes(q);
        const matchesAlterations = item.recommendedAlterations?.some(a => a.toLowerCase().includes(q));
        return matchesTitle || matchesDesc || matchesTechnique || matchesAlterations;
      }

      return true;
    });

    // Ordenação: Destaques & Mais Pedidos primeiro, Menor Preço, Maior Preço, ou Alfabética
    return [...list].sort((a, b) => {
      if (sortBy === 'destaques') {
        const aHigh = (a.isPopular || (a.badge && a.badge.length > 0)) ? 1 : 0;
        const bHigh = (b.isPopular || (b.badge && b.badge.length > 0)) ? 1 : 0;
        if (bHigh !== aHigh) return bHigh - aHigh;
        return 0;
      }
      if (sortBy === 'menor-preco') {
        return a.price - b.price;
      }
      if (sortBy === 'maior-preco') {
        return b.price - a.price;
      }
      if (sortBy === 'nome') {
        return a.title.localeCompare(b.title, 'pt-BR');
      }
      return 0;
    });
  }, [haircuts, selectedCategory, searchQuery, showOnlyFavorites, favorites, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<HaircutCategory, number> = {
      todos: 0,
      assinatura: 0,
      feminino: 0,
      masculino: 0,
      combos: 0,
      coloracao: 0,
      tratamentos: 0,
    };

    haircuts.filter(h => h.available).forEach((item) => {
      counts.todos += 1;
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });

    return counts;
  }, [haircuts]);

  // Select cut to open WhatsApp customization modal
  const handleSelectCut = (item: HaircutItem, alteration?: string) => {
    setSelectedCutForBooking(item);
    setInitialAlteration(alteration || '');
  };

  // When WhatsApp redirection is confirmed from the modal
  const handleConfirmWhatsAppBooking = (data: {
    haircut: HaircutItem;
    clientName: string;
    alteration: string;
    selectedAddOns: AddOnOption[];
    preferredDay: string;
    preferredShift: string;
    customNotes: string;
    totalPrice: number;
  }) => {
    const newLead: BookingLead = {
      id: `lead-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      clientName: data.clientName,
      haircutTitle: data.haircut.title,
      haircutPrice: data.haircut.price,
      totalPrice: data.totalPrice,
      alteration: data.alteration,
      addOns: data.selectedAddOns.map(a => a.name),
      preferredDay: data.preferredDay,
      preferredShift: data.preferredShift,
      notes: data.customNotes,
    };

    setStats(prev => {
      const currentCount = prev.clicksPerHaircut[data.haircut.id] || 0;
      return {
        totalClicksWhatsApp: prev.totalClicksWhatsApp + 1,
        clicksPerHaircut: {
          ...prev.clicksPerHaircut,
          [data.haircut.id]: currentCount + 1,
        },
        recentLeads: [newLead, ...(prev.recentLeads || []).slice(0, 19)],
      };
    });

    showToast(`Redirecionando para o WhatsApp do ${salonConfig.salonName}...`);
  };

  const handleResetDefaults = () => {
    setHaircuts(INITIAL_HAIRCUTS);
    setSalonConfig(INITIAL_SALON_CONFIG);
    setStats({
      totalClicksWhatsApp: 0,
      clicksPerHaircut: {},
      recentLeads: [],
    });
    localStorage.removeItem(STORAGE_KEY_HAIRCUTS);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    localStorage.removeItem(STORAGE_KEY_STATS);
    showToast('Cardápio restaurado para o padrão original com sucesso!');
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-neutral-900 text-neutral-100 px-4 py-3 rounded-2xl shadow-xl border border-amber-400 flex items-center gap-2 text-xs sm:text-sm font-semibold animate-fadeIn">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        salonConfig={salonConfig}
        onOpenAdmin={handleOpenAdmin}
        totalItemsCount={haircuts.length}
      />

      {/* Hero with Restaurant Menu Concept */}
      <MenuHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCuts={categoryCounts.todos}
      />

      {/* Main Catalog Layout with Left Vertical Menu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grow w-full">
        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          
          {/* Vertical Menu on the Left (Desktop Sticky & Mobile Drawer) */}
          <CatalogSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setShowOnlyFavorites(false);
              setSelectedCategory(cat);
            }}
            categoryCounts={categoryCounts}
            salonConfig={salonConfig}
            favoritesCount={favorites.length}
            showOnlyFavorites={showOnlyFavorites}
            onToggleShowFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Right Main Catalog Area */}
          <div className="grow min-w-0 w-full">
            
            {/* Mobile-Only Top Category Trigger & Mode Toggle */}
            <div className="md:hidden space-y-2 mb-5">
              <div className="flex items-center justify-between gap-2.5 bg-[#141312] p-2.5 rounded-2xl border border-neutral-800 shadow-md">
                <button
                  type="button"
                  id="mobile-open-cats-btn"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 active:scale-95 text-neutral-950 text-xs font-bold transition-all shadow-xs cursor-pointer grow justify-center"
                >
                  <Menu className="w-4 h-4" />
                  <span className="truncate">
                    {showOnlyFavorites
                      ? '★ Meus Favoritos'
                      : CATEGORY_NAMES[selectedCategory] || 'Categorias'}
                  </span>
                  <span className="text-[10px] bg-neutral-950/20 px-1.5 py-0.5 rounded-full font-extrabold">
                    {filteredHaircuts.length}
                  </span>
                </button>

                <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-amber-500 text-neutral-950 shadow-2xs font-bold'
                        : 'text-neutral-400 hover:text-amber-300'
                    }`}
                    title="Vitrine de Fotos"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('classic')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'classic'
                        ? 'bg-amber-500 text-neutral-950 shadow-2xs font-bold'
                        : 'text-neutral-400 hover:text-amber-300'
                    }`}
                    title="Lista com Detalhes"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Quick Sort Selector */}
              <div className="flex items-center justify-between gap-2 bg-[#141312] px-3 py-2 rounded-xl border border-neutral-800 shadow-2xs text-xs">
                <span className="text-neutral-400 font-semibold text-[11px] flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  Ordenar:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-neutral-900 text-neutral-100 text-xs font-bold px-2 py-1 rounded-lg border border-neutral-800 focus:outline-hidden"
                >
                  <option value="destaques">★ Destaques &amp; Mais Pedidos</option>
                  <option value="menor-preco">Menor Preço</option>
                  <option value="maior-preco">Maior Preço</option>
                  <option value="nome">Nome (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Results / Category Title Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {showOnlyFavorites
                    ? 'Meus Cortes Favoritos'
                    : CATEGORY_NAMES[selectedCategory] || 'Cardápio de Cortes'}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-900 text-amber-400 border border-neutral-800 shadow-2xs">
                  {filteredHaircuts.length} {filteredHaircuts.length === 1 ? 'peça' : 'opções'}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5">
                {/* Desktop Sort Dropdown */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                    Ordenar por:
                  </span>
                  <div className="relative">
                    <select
                      id="desktop-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none bg-[#141312] text-neutral-100 text-xs font-bold pl-3 pr-8 py-1.5 rounded-xl border border-neutral-800 hover:border-amber-400/50 focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 shadow-sm cursor-pointer"
                    >
                      <option value="destaques">★ Em Destaque (Mais Pedidos)</option>
                      <option value="menor-preco">Menor Preço</option>
                      <option value="maior-preco">Maior Preço</option>
                      <option value="nome">Nome (A a Z)</option>
                    </select>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-400 pointer-events-none">▼</span>
                  </div>
                </div>

                {/* Desktop view switcher in title bar */}
                <div className="hidden sm:flex items-center gap-1 bg-[#141312] p-1 rounded-xl border border-neutral-800 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                        : 'text-neutral-400 hover:text-amber-300'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Vitrine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('classic')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'classic'
                        ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                        : 'text-neutral-400 hover:text-amber-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Detalhada</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredHaircuts.length === 0 ? (
              <div className="bg-[#141312] rounded-3xl p-12 text-center border border-neutral-800 shadow-md max-w-lg mx-auto my-10">
                <div className="w-12 h-12 rounded-full bg-neutral-900 text-amber-400 mx-auto flex items-center justify-center mb-3 border border-neutral-800">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-white mb-1">
                  Nenhum corte encontrado
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  {showOnlyFavorites
                    ? 'Você ainda não salvou nenhum corte como favorito. Clique no ícone de coração nos cards para salvar.'
                    : 'Não encontramos resultados para a sua busca nesta categoria.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowOnlyFavorites(false);
                    setSelectedCategory('todos');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-amber-950/40"
                >
                  Ver Todo o Catálogo
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'classic'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5'
                }
              >
                {filteredHaircuts.map((item) =>
                  viewMode === 'classic' ? (
                    <ClassicMenuCard
                      key={item.id}
                      item={item}
                      onSelectCut={handleSelectCut}
                    />
                  ) : (
                    <PhotoMenuCard
                      key={item.id}
                      item={item}
                      onSelectCut={handleSelectCut}
                      isFavorite={favorites.includes(item.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Category Menu Button on bottom-left for Mobile */}
      <aside className="fixed bottom-6 left-4 z-40 md:hidden">
        <button
          type="button"
          id="floating-mobile-categories-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-neutral-950 font-bold text-xs shadow-xl shadow-amber-950/60 border border-amber-300/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Ver categorias de corte"
        >
          <Menu className="w-4 h-4" />
          <span>Categorias</span>
        </button>
      </aside>

      {/* Floating WhatsApp Quick Button on bottom-right - verde obrigatório */}
      <aside className="fixed bottom-6 right-4 sm:right-6 z-40">
        <a
          id="floating-whatsapp-btn"
          href={`https://wa.me/${salonConfig.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(salonConfig.welcomeMessageTemplate || `Olá, ${salonConfig.salonName}! Gostaria de agendar um horário.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 group"
          title="Falar diretamente no WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">WhatsApp do Salão</span>
        </a>
      </aside>

      {/* Booking / WhatsApp Redirection Customization Modal */}
      <BookingModal
        haircut={selectedCutForBooking}
        salonConfig={salonConfig}
        initialAlteration={initialAlteration}
        onClose={() => setSelectedCutForBooking(null)}
        onConfirmWhatsApp={handleConfirmWhatsAppBooking}
      />

      {/* Admin Login Modal (Initial authentication modal) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Panel (Only accessible after database authentication) */}
      <AdminPanel
        isOpen={isAdminOpen && isAdminAuthenticated}
        onClose={() => setIsAdminOpen(false)}
        haircuts={haircuts}
        salonConfig={salonConfig}
        stats={stats}
        onUpdateHaircuts={(updated) => {
          setHaircuts(updated);
          showToast('Cardápio de cortes atualizado!');
        }}
        onUpdateSalonConfig={(updated) => {
          setSalonConfig(updated);
          showToast('Configurações do Salão salvas!');
        }}
        onResetDefaults={handleResetDefaults}
        onLogout={handleAdminLogout}
      />

      {/* Salon Footer */}
      <SalonFooter
        salonConfig={salonConfig}
        onOpenAdmin={handleOpenAdmin}
      />

    </div>
  );
}
