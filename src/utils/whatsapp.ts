import { HaircutItem, AddOnOption, SalonConfig } from '../types';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export interface WhatsAppMessagePayload {
  haircut: HaircutItem;
  salonConfig: SalonConfig;
  alteration?: string;
  selectedAddOns?: AddOnOption[];
  clientName?: string;
  preferredDay?: string;
  preferredShift?: string;
  customNotes?: string;
}

export function generateWhatsAppMessage(payload: WhatsAppMessagePayload): string {
  const { haircut, salonConfig, alteration, selectedAddOns = [], clientName, preferredDay, preferredShift, customNotes } = payload;
  
  const addOnsTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
  const totalPrice = haircut.price + addOnsTotal;

  let message = '';
  if (salonConfig.orderMessageTemplate && salonConfig.orderMessageTemplate.trim()) {
    message += `${salonConfig.orderMessageTemplate.trim()}\n\n`;
  } else {
    message += `*Olá, ${salonConfig.salonName}!* \n`;
    message += `Gostaria de solicitar um agendamento pelo cardápio de cortes.\n\n`;
  }

  if (clientName && clientName.trim()) {
    message += `• *Nome:* ${clientName.trim()}\n`;
  }

  message += `• *Corte / Serviço:* ${haircut.title}\n`;
  message += `• *Valor Base:* ${formatBRL(haircut.price)}\n`;

  if (alteration && alteration.trim()) {
    message += `• *Aplicação / Alteração Desejada:* ${alteration.trim()}\n`;
  }

  if (selectedAddOns.length > 0) {
    message += `• *Adicionais Selecionados:*\n`;
    selectedAddOns.forEach(addon => {
      message += `   - ${addon.name} (+${formatBRL(addon.price)})\n`;
    });
    message += `• *Valor Total Estimado:* ${formatBRL(totalPrice)}\n`;
  }

  if (preferredDay && preferredDay.trim()) {
    message += `• *Dia e Período de Preferência:* ${preferredDay.trim()}`;
    if (preferredShift && preferredShift.trim() && preferredShift !== 'Qualquer') {
      message += ` (${preferredShift.trim()})`;
    } else if (preferredShift === 'Qualquer' && !preferredDay.includes('Qualquer')) {
      message += ` (Qualquer horário)`;
    }
    message += `\n`;
  }

  if (customNotes && customNotes.trim()) {
    message += `• *Observações:* ${customNotes.trim()}\n`;
  }

  message += `\nVocês teriam disponibilidade para essa data? Aguardo a confirmação do horário, obrigado(a)!`;

  return message;
}

export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  // Clean phone number: remove non-digits
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
