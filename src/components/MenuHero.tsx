import React from 'react';
import { Search, X } from 'lucide-react';

interface MenuHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCuts?: number;
}

export const MenuHero: React.FC<MenuHeroProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-8 sm:pt-10 sm:pb-10 bg-gradient-to-b from-[#161412] via-[#0F0D0C] to-[#0C0A09] border-b border-amber-500/20">
      {/* Luxurious warm gold ambient radial glows */}
      <div className="absolute top-0 right-1/4 -mt-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left relative z-10">
        
        {/* Frase objetiva focada em cortes e atendimento com hora marcada */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight leading-snug sm:leading-tight mb-5 sm:mb-6 max-w-3xl">
          Cortes de cabelo e transformações com{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400">
            atendimento exclusivo com hora marcada
          </span>
        </h1>

        {/* Busca posicionada logo abaixo da frase alinhada à esquerda */}
        <div className="max-w-md relative">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-cuts-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por corte, técnica ou estilo..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-[#181615] border border-amber-500/30 hover:border-amber-400/60 focus:border-amber-400 rounded-2xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-4 focus:ring-amber-500/20 shadow-md transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-amber-300 p-1 cursor-pointer"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
