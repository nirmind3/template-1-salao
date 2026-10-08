import React from 'react';
import { HaircutItem } from '../types';
import { formatBRL } from '../utils/whatsapp';
import { Scissors, MessageCircle } from 'lucide-react';

interface ClassicMenuCardProps {
  item: HaircutItem;
  onSelectCut: (item: HaircutItem, alteration?: string) => void;
}

export const ClassicMenuCard: React.FC<ClassicMenuCardProps> = ({ item, onSelectCut }) => {
  return (
    <article
      id={`classic-card-${item.id}`}
      onClick={() => onSelectCut(item)}
      className="group bg-[#141312] rounded-2xl p-4 border border-neutral-800 hover:border-amber-400/60 transition-all duration-300 hover:shadow-card-hover flex flex-col sm:flex-row gap-4 justify-between cursor-pointer"
    >
      {/* Photo Media */}
      <div className="relative w-full sm:w-40 sm:h-40 aspect-square rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-neutral-800">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {item.badge && (
          <span className="absolute bottom-2 left-2 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-950/90 text-amber-300 border border-amber-500/30 shadow-xs flex items-center gap-1">
            <Scissors className="w-2.5 h-2.5 text-amber-400" />
            {item.badge}
          </span>
        )}
      </div>

      {/* Content & Details */}
      <div className="grow min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-0.5">
                {item.category}
              </span>
              <h3 className="font-display text-base sm:text-lg font-semibold text-white group-hover:text-amber-300 transition-colors leading-snug">
                {item.title}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-amber-400">R$</span>
                <span className="text-lg font-bold text-white font-mono">
                  {item.price}
                </span>
              </div>
            </div>
          </div>

          {item.subtitle && (
            <p className="text-xs text-neutral-400 italic mt-0.5">
              “{item.subtitle}”
            </p>
          )}

          <p className="text-xs text-neutral-300 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>

          {/* Technique / Alteration chips */}
          {item.recommendedAlterations && item.recommendedAlterations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {item.recommendedAlterations.slice(0, 2).map((alt, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2.5 py-0.5 rounded-lg bg-neutral-900 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-medium"
                >
                  <Scissors className="w-2.5 h-2.5 text-amber-400" />
                  <span className="truncate max-w-[170px]">{alt}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Action */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Atendimento individual</span>
          </div>

          {/* Botão de WhatsApp verde */}
          <button
            id={`btn-select-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCut(item);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
            <span>Fazer Pedido</span>
          </button>
        </div>
      </div>
    </article>
  );
};
