import React, { useState } from 'react';
import { HaircutItem } from '../types';
import { formatBRL } from '../utils/whatsapp';
import { MessageCircle, Scissors, Heart } from 'lucide-react';

interface PhotoMenuCardProps {
  item: HaircutItem;
  onSelectCut: (item: HaircutItem, alteration?: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const PhotoMenuCard: React.FC<PhotoMenuCardProps> = ({
  item,
  onSelectCut,
  isFavorite: initialIsFavorite = false,
  onToggleFavorite,
}) => {
  const [favorite, setFavorite] = useState(initialIsFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    if (onToggleFavorite) {
      onToggleFavorite(item.id);
    }
  };

  return (
    <article
      id={`photo-card-${item.id}`}
      onClick={() => onSelectCut(item)}
      className="group bg-[#141312] rounded-2xl overflow-hidden border border-neutral-800 hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover flex flex-col justify-between cursor-pointer relative"
    >
      {/* Media Image */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-neutral-900 shrink-0 border-b border-neutral-800">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top-left Flags & Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {item.badge && (
            <span className="inline-flex items-center gap-1 bg-neutral-950/90 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 shadow-sm">
              <Scissors className="w-2.5 h-2.5 text-amber-400" />
              {item.badge}
            </span>
          )}
        </div>

        {/* Top-right Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 shadow-sm ${
            favorite
              ? 'bg-amber-400 text-neutral-950 shadow-amber-950/50'
              : 'bg-neutral-900/80 backdrop-blur-xs text-neutral-400 hover:text-amber-400 hover:bg-neutral-900 border border-neutral-700'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between grow">
        <div>
          {/* Category Chip */}
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
            {item.category}
          </span>

          {/* Title in Fraunces serif */}
          <h3 className="font-display text-sm sm:text-base font-semibold text-white leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Subtitle / Note */}
          {item.subtitle && (
            <p className="text-xs text-neutral-400 line-clamp-1 mt-1 italic">
              “{item.subtitle}”
            </p>
          )}

          {/* Alteration suggestion tag */}
          {item.recommendedAlterations && item.recommendedAlterations.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-300 bg-neutral-900 border border-amber-500/20 px-2 py-1 rounded-lg w-fit">
              <Scissors className="w-2.5 h-2.5 shrink-0 text-amber-400" />
              <span className="truncate max-w-[170px]">
                {item.recommendedAlterations[0]}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Price Row & CTA */}
        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-amber-400">R$</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono leading-none">
                {item.price}
              </span>
            </div>
            <span className="text-[9px] text-neutral-500 block mt-0.5">
              agendamento direto
            </span>
          </div>

          {/* Botão de WhatsApp sempre verde */}
          <button
            id={`btn-photo-select-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCut(item);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
            <span>Fazer Pedido</span>
          </button>
        </div>
      </div>
    </article>
  );
};
