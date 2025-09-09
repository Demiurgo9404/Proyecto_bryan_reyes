// Configuración de notificaciones
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  newMessage: boolean;
  newFollower: boolean;
  newTip: boolean;
  sessionReminder: boolean;
  promotional: boolean;
}

// Enlaces a redes sociales
export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  onlyfans?: string;
  website?: string;
}

// Elementos de la galería
export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  isPrivate: boolean;
  createdAt: Date;
}

// Estado de verificación
export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  id: boolean;
  social: boolean;
  video: boolean;
}

// Preferencias de usuario
export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
}

// Configuración de privacidad
export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showViewerCount: boolean;
  showEarnings: boolean;
  allowAnonymous: boolean;
  allowScreenshots: boolean;
  allowRecording: boolean;
  blockCountries: string[];
}

// Configuración de seguridad
export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  deviceManagement: boolean;
  sessionTimeout: number; // en minutos
}

// Niveles de suscripción
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  isActive: boolean;
}

// Preferencias de contenido
export interface ContentPreferences {
  categories: string[];
  tags: string[];
  isExplicitAllowed: boolean;
  ageRestriction: '18+' | '21+' | 'all';
}

// Configuración de pagos
export interface PaymentSettings {
  payoutMethod: 'paypal' | 'bank' | 'crypto' | 'paxum' | 'other';
  payoutEmail?: string;
  bankDetails?: BankDetails;
  taxInfo?: TaxInfo;
  autoWithdraw: boolean;
  withdrawThreshold: number;
}

// Detalles bancarios
export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
}

// Información fiscal
export interface TaxInfo {
  ssn?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Perfil completo del modelo
export interface ModelProfile {
  displayName: string;
  bio: string;
  hourlyRate: number;
  isPublic: boolean;
  isAcceptingCalls: boolean;
  isAcceptingMessages: boolean;
  isAcceptingTips: boolean;
  isAcceptingRequests: boolean;
  notificationPreferences: NotificationPreferences;
  socialLinks?: SocialLinks;
  gallery?: GalleryItem[];
  verificationStatus: VerificationStatus;
  preferences: UserPreferences;
  privacySettings: PrivacySettings;
  securitySettings: SecuritySettings;
  subscriptionTiers?: SubscriptionTier[];
  contentPreferences: ContentPreferences;
  paymentSettings: PaymentSettings;
}
