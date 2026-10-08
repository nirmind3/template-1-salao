import React from 'react';
import { HaircutCategory, SalonConfig, SortOption } from '../types';
import {
  Scissors,
  Award,
  User,
  Users,
  Package,
  Palette,
  Droplets,
  Heart,
  MessageCircle,
  Clock,
  MapPin,
  Check,
  X,
  LayoutGrid,
  BookOpen,
  ArrowUpDown,
} from 'lucide-react';

interface CatalogSidebarProps {
  selectedCategory: HaircutCategory;
  onSelectCategory: (category: HaircutCategory) => void;
  categoryCounts: Record<HaircutCategory, number>;
  salonConfig: SalonConfig;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleShowFavorites: () => void;
  viewMode?: 'classic' | 'grid';
  onToggleViewMode?: (mode: 'classic' | 'grid') => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const CatalogSidebar: React.FC<CatalogSidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  salonConfig,
  favoritesCount,
  showOnlyFavorites,
  onToggleShowFavorites,
  viewMode = 'grid',
  onToggleViewMode,
  isMobileOpen = false,
  onCloseMobile,
  sortBy,
  onSortChange,
}) => {
  const categories: {
    id: HaircutCategory;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'todos', label: 'Todo o Catálogo', icon: Scissors },
    { id: 'assinatura', label: 'Cortes Assinatura', icon: Award },
    { id: 'feminino', label: 'Cortes Femininos', icon: User },
    { id: 'masculino', label: 'Cortes Masculinos', icon: Users },
    { id: 'combos', label: 'Combos & Pacotes', icon: Package },
    { id: 'coloracao', label: 'Coloração & Mechas', icon: Palette },
    { id: 'tratamentos', label: 'Tratamentos', icon: Droplets },
  ];

  const handleSelect = (catId: HaircutCategory) => {
    if (showOnlyFavorites) onToggleShowFavorites();
    onSelectCategory(catId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleFavoritesClick = () => {
    onToggleShowFavorites();
    if (onCloseMobile) onCloseMobile();
  };

  const menuContent = (
    <div className="space-y-5">
      {/* Category List Card */}
      <div className="bg-[#141312] rounded-2xl p-4 border border-neutral-800/80 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Menu de Categorias
          </h2>
          <span className="text-[10px] text-neutral-400 font-medium">
            {categories.length} seções
          </span>
        </div>

        <nav aria-label="Categorias verticais" className="space-y-1">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = !showOnlyFavorites && selectedCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                id={`vertical-cat-${cat.id}`}
                onClick={() => handleSelect(cat.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-neutral-950 font-bold shadow-md shadow-amber-950/40'
                    : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-amber-300 border border-transparent hover:border-amber-500/20'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-neutral-950' : 'text-amber-400'}`} />
                  <span className="truncate">{cat.label}</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isSelected
                      ? 'bg-neutral-950/30 text-neutral-950'
                      : 'bg-neutral-900 text-amber-300 border border-neutral-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Favorites filter option */}
        {favoritesCount > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-800">
            <button
              onClick={handleFavoritesClick}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98] ${
                showOnlyFavorites
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-neutral-950 font-bold shadow-md'
                  : 'bg-neutral-900 text-amber-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Heart
                  className={`w-4 h-4 ${
                    showOnlyFavorites ? 'text-neutral-950 fill-neutral-950' : 'text-amber-400 fill-amber-400'
                  }`}
                />
                <span>Meus Favoritos</span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  showOnlyFavorites ? 'bg-neutral-950/30 text-neutral-950' : 'bg-neutral-800 text-amber-300'
                }`}
              >
                {favoritesCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* View Mode Switcher (Vitrine vs Lista) */}
      {onToggleViewMode && (
        <div className="bg-[#141312] rounded-2xl p-3.5 border border-neutral-800/80 shadow-lg shadow-black/40">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2 px-1">
            Modo de Exibição
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => onToggleViewMode('grid')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vitrine</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('classic')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'classic'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Detalhada</span>
            </button>
          </div>
        </div>
      )}

      {/* Sorting Block */}
      <div className="bg-[#141312] rounded-2xl p-3.5 border border-neutral-800/80 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Ordenar Catálogo
          </span>
          <ArrowUpDown className="w-3 h-3 text-amber-400" />
        </div>
        <div className="space-y-1">
          {[
            { id: 'destaques' as SortOption, label: 'Em Destaque (Mais Pedidos)' },
            { id: 'menor-preco' as SortOption, label: 'Menor Preço' },
            { id: 'maior-preco' as SortOption, label: 'Maior Preço' },
            { id: 'nome' as SortOption, label: 'Nome (A a Z)' },
          ].map((opt) => {
            const isSelected = sortBy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSortChange(opt.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-amber-300'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-neutral-950 shrink-0 font-bold" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Salão & Atendimento */}
      <div className="bg-[#141312] rounded-2xl p-4 border border-neutral-800/80 shadow-lg shadow-black/40">
        <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
          Atendimento do Salão
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed mb-3">
          Atendimento reservado, sem filas e com hora marcada.
        </p>
        <div className="space-y-1.5 text-[11px] text-neutral-400 mb-3">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Lavagem e acabamento inclusos</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Pontualidade e dedicação exclusiva</span>
          </div>
        </div>

        {/* WhatsApp button - verde obrigatório */}
        <a
          href={`https://wa.me/${salonConfig.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Olá, ${salonConfig.salonName}! Gostaria de tirar uma dúvida sobre os cortes.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
          <span>Falar com o Salão</span>
        </a>
      </div>

      {/* Atelier & Localização */}
      <div className="bg-[#121110] rounded-2xl p-4 border border-neutral-800 text-xs text-neutral-400 space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">{salonConfig.salonName}</span>
            <span className="text-[11px] text-neutral-400">
              {salonConfig.address} — {salonConfig.neighborhoodCity}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1.5 border-t border-neutral-800">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] font-medium text-neutral-300">{salonConfig.openingHours}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Vertical Menu on Left side */}
      <aside
        aria-label="Menu vertical do catálogo"
        className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24 self-start"
      >
        {menuContent}
      </aside>

      {/* Mobile Slide-in Drawer from Left */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer panel on left */}
          <div
            className="relative w-80 max-w-[85vw] bg-[#141312] h-full shadow-2xl p-4 sm:p-6 overflow-y-auto z-50 flex flex-col justify-between border-r border-neutral-800 animate-in slide-in-from-left duration-200"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs font-bold">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-base text-white">
                    Categorias
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-amber-300 flex items-center justify-center border border-neutral-700 cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              {menuContent}
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 text-center text-[11px] text-neutral-500">
              {salonConfig.salonName} · {salonConfig.neighborhoodCity}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
