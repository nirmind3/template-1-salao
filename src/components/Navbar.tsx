import React from 'react';
import { Scissors, MessageCircle, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { SalonConfig } from '../types';

interface NavbarProps {
  salonConfig: SalonConfig;
  onOpenAdmin: () => void;
  totalItemsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ salonConfig, onOpenAdmin }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121110]/95 backdrop-blur-md border-b border-neutral-800/80 shadow-md">
      {/* Top gold luxury accent bar */}
      <div id="top-gold-bar" className="bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-500 h-1.5 sm:h-2 w-full" />

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-950/50 border border-amber-300/40 shrink-0">
              <Scissors className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {salonConfig.salonName}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium hidden sm:block">
                {salonConfig.neighborhoodCity}
              </p>
            </div>
          </div>

          {/* Quick info badges on desktop (Horários e Localização) */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1.5 rounded-full border border-neutral-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-neutral-300">{salonConfig.openingHours}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1.5 rounded-full border border-neutral-800">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-neutral-300">{salonConfig.neighborhoodCity}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp direct contact - verde obrigatório */}
            <a
              id="header-whatsapp-btn"
              href={`https://wa.me/${salonConfig.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(salonConfig.welcomeMessageTemplate || `Olá, ${salonConfig.salonName}! Gostaria de agendar um horário.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
              title="Falar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span className="hidden xs:inline">Agendar no WhatsApp</span>
              <span className="xs:hidden">WhatsApp</span>
            </a>

            {/* Admin Panel Button */}
            <button
              id="open-admin-btn"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Acessar Painel do Administrador"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Painel</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
