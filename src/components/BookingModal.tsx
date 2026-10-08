import React, { useState } from 'react';
import { HaircutItem, SalonConfig, AddOnOption } from '../types';
import { formatBRL, generateWhatsAppMessage, buildWhatsAppLink } from '../utils/whatsapp';
import { X, MessageCircle, Scissors, Check, Calendar } from 'lucide-react';

interface BookingModalProps {
  haircut: HaircutItem | null;
  salonConfig: SalonConfig;
  initialAlteration?: string;
  onClose: () => void;
  onConfirmWhatsApp: (data: {
    haircut: HaircutItem;
    clientName: string;
    alteration: string;
    selectedAddOns: AddOnOption[];
    preferredDay: string;
    preferredShift: string;
    customNotes: string;
    totalPrice: number;
  }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  haircut,
  salonConfig,
  initialAlteration = '',
  onClose,
  onConfirmWhatsApp,
}) => {
  if (!haircut) return null;

  const [clientName, setClientName] = useState('');
  const [alteration, setAlteration] = useState(initialAlteration || haircut.recommendedAlterations?.[0] || 'Manter o comprimento e tirar pontas');
  const [customAlteration, setCustomAlteration] = useState('');
  const [preferredDay, setPreferredDay] = useState('Qualquer dia (Terça a Sábado)');
  const [preferredShift, setPreferredShift] = useState('Qualquer');
  const [customNotes, setCustomNotes] = useState('');

  // Common quick alteration options
  const defaultAlterationOptions = [
    'Apenas o corte conforme foto do modelo',
    'Manter o comprimento e tirar pontas',
    'Dar mais leveza com camadas suaves',
    'Reduzir volume sem encurtar',
    'Mudar o estilo completamente',
    'Adicionar franja cortina (Curtain Bangs)',
    'Desconectar as pontas com navalha',
    'Outra alteração personalizada',
  ];

  const totalPrice = haircut.price;

  const finalAlterationText = alteration === 'Outra alteração personalizada' && customAlteration.trim()
    ? customAlteration.trim()
    : alteration;

  const generatedMessage = generateWhatsAppMessage({
    haircut,
    salonConfig,
    alteration: finalAlterationText,
    selectedAddOns: [],
    clientName,
    preferredDay,
    preferredShift,
    customNotes,
  });

  const handleSendToWhatsApp = () => {
    onConfirmWhatsApp({
      haircut,
      clientName,
      alteration: finalAlterationText,
      selectedAddOns: [],
      preferredDay,
      preferredShift,
      customNotes,
      totalPrice,
    });

    const url = buildWhatsAppLink(salonConfig.whatsappNumber, generatedMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        id="booking-modal-container"
        className="relative w-full max-w-2xl bg-[#141312] rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden my-auto max-h-[92vh] flex flex-col text-neutral-100"
      >
        {/* Header with Haircut Photo & Details */}
        <div className="relative bg-gradient-to-r from-[#1E1B18] via-[#26221D] to-[#1E1B18] border-b border-amber-500/30 text-white p-5 sm:p-6 shrink-0">
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
              Personalizar Pedido no Cardápio
            </span>
          </div>

          <div className="flex gap-4 items-center">
            {/* Haircut image */}
            <img
              src={haircut.imageUrl}
              alt={haircut.title}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/40 shadow-md shrink-0"
            />
            <div className="grow min-w-0">
              <h3 className="text-lg sm:text-2xl font-serif-luxury font-bold leading-tight text-white">
                {haircut.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs sm:text-sm text-neutral-300">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-neutral-400">Valor Base:</span>
                  <span className="text-lg font-bold font-mono text-amber-400">
                    {formatBRL(haircut.price)}
                  </span>
                  <span className="text-[10px] text-neutral-500">(hipotético)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-neutral-300">
          
          {/* STEP 1: Alteration / Application desired in the hair */}
          <div>
            <label className="block text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Aplicação ou Alteração Desejada no Cabelo:</span>
              <span className="text-amber-400 font-bold">*</span>
            </label>
            <p className="text-xs text-neutral-400 mb-2.5">
              Indique como você quer que o corte seja adaptado para os seus fios (será enviado pronto no WhatsApp).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {defaultAlterationOptions.map((opt, idx) => {
                const isSelected = alteration === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAlteration(opt)}
                    className={`text-left text-xs p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 text-amber-200 font-semibold shadow-xs ring-1 ring-amber-400/50'
                        : 'border-neutral-800 bg-neutral-900/90 hover:border-amber-500/30 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1 font-bold" />}
                  </button>
                );
              })}
            </div>

            {alteration === 'Outra alteração personalizada' && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={customAlteration}
                  onChange={(e) => setCustomAlteration(e.target.value)}
                  placeholder="Ex: Quero diminuir 4 dedos, repicar a franja e levar uma foto de referência..."
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-amber-400/50 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* STEP 2: Client Name & Preferred Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-200 mb-1">
                Seu Nome (Opcional):
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-200 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Dia e Período de Preferência:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    id="select-preferred-day"
                    value={preferredDay}
                    onChange={(e) => setPreferredDay(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-800 rounded-xl text-xs bg-neutral-900 text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Qualquer dia (Terça a Sábado)">Qualquer dia (Terça a Sábado)</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    id="select-preferred-shift"
                    value={preferredShift}
                    onChange={(e) => setPreferredShift(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-800 rounded-xl text-xs bg-neutral-900 text-neutral-100 focus:ring-2 focus:ring-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Qualquer">Qualquer horário / período</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-200 mb-1">
              Observações Adicionais:
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Ex: Cabelo com tintura nas pontas, prefiro secagem natural..."
              className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>

        </div>

        {/* Footer with Summary and Action */}
        <div className="p-4 sm:p-5 bg-[#100F0E] border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-xs text-neutral-400 block">Total do Pedido:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {formatBRL(totalPrice)}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                (pagamento no salão)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Voltar ao Cardápio
            </button>

            {/* Botão de WhatsApp verde */}
            <button
              id="btn-confirm-whatsapp-redirect"
              type="button"
              onClick={handleSendToWhatsApp}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Fazer Pedido</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
