import React from 'react';
import { Scissors, Phone, MapPin, Clock, Instagram, ShieldCheck, Heart } from 'lucide-react';
import { SalonConfig } from '../types';

interface SalonFooterProps {
  salonConfig: SalonConfig;
  onOpenAdmin: () => void;
}

export const SalonFooter: React.FC<SalonFooterProps> = ({ salonConfig, onOpenAdmin }) => {
  return (
    <footer className="bg-[#100F0E] border-t border-neutral-800 text-neutral-400 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Atelier */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-950/40 text-neutral-950 font-bold">
                <Scissors className="w-5 h-5 text-neutral-950" />
              </div>
              <span className="text-2xl font-display font-bold text-white">
                {salonConfig.salonName}
              </span>
            </div>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              Sem filas ou surpresas — cada corte é planejado para realçar seus traços naturais com atendimento exclusivo em {salonConfig.neighborhoodCity}.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://instagram.com/${salonConfig.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-amber-400" />
                <span>{salonConfig.instagramHandle}</span>
              </a>
              
              {/* Botão de WhatsApp verde */}
              <a
                href={`https://wa.me/${salonConfig.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950/40"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Direto</span>
              </a>
            </div>
          </div>

          {/* Col 2: Horários & Localização */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Atendimento & Horários
            </h3>
            <div className="space-y-2.5 text-neutral-400">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{salonConfig.openingHours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-neutral-200">{salonConfig.address}</span>
                  <span className="text-neutral-400">{salonConfig.neighborhoodCity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Gestão & Painel */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Administração
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Área restrita para atualizar valores, adicionar novos cortes, habilitar promoções e gerenciar contatos do salão.
            </p>
            <button
              id="footer-open-admin-btn"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 hover:border-amber-400/60 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Painel Administrativo</span>
            </button>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} {salonConfig.salonName} · {salonConfig.neighborhoodCity}. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
            <span>{salonConfig.salonName}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
