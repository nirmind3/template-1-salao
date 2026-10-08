export type HaircutCategory = 
  | 'todos'
  | 'assinatura'
  | 'feminino'
  | 'masculino'
  | 'tratamentos'
  | 'coloracao'
  | 'combos';

export interface HaircutOption {
  id: string;
  name: string;
  price: number;
}

export interface HaircutItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'assinatura' | 'feminino' | 'masculino' | 'tratamentos' | 'coloracao' | 'combos';
  price: number;
  originalPrice?: number;
  durationMinutes: number;
  description: string;
  ingredientsOrTechnique?: string; // Restaurant style metaphor: "Técnica / Produtos usados"
  badge?: string; // e.g. "Especialidade da Casa", "Mais Pedido", "Tendência 2026"
  imageUrl: string;
  isPopular?: boolean;
  available: boolean;
  recommendedAlterations?: string[]; // e.g. ["Manter comprimento e tirar pontas", "Repicar com camadas leves", "Franja cortininha"]
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface SalonConfig {
  salonName: string;
  tagline: string;
  whatsappNumber: string; // digits only or with country code, e.g. "5511999998888"
  instagramHandle: string;
  address: string;
  neighborhoodCity: string;
  openingHours: string;
  announcementText?: string;
  showPromoBanner: boolean;
  welcomeMessageTemplate?: string;
  orderMessageTemplate?: string;
}

export interface BookingLead {
  id: string;
  timestamp: string;
  clientName: string;
  haircutTitle: string;
  haircutPrice: number;
  totalPrice: number;
  alteration: string;
  addOns: string[];
  preferredDay: string;
  preferredShift: string;
  notes: string;
}

export interface AdminStats {
  totalClicksWhatsApp: number;
  clicksPerHaircut: Record<string, number>;
  recentLeads: BookingLead[];
}

export type SortOption = 'destaques' | 'menor-preco' | 'maior-preco' | 'nome';
