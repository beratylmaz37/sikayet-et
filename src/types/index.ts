export type ComplaintStatus = 'İnceleniyor' | 'Çözüm Aşamasında' | 'Çözüldü' | 'Reddedildi';

export type ComplaintCategory = 
  | 'Kütüphane'
  | 'Spor Tesisleri'
  | 'Yemekhane'
  | 'Kantin'
  | 'Temizlik' 
  | 'Tesis & Tamirat' 
  | 'Derslikler' 
  | 'Bilişim & İnternet' 
  | 'Ulaşım & Servis' 
  | 'Diğer';

export interface Comment {
  id: string;
  author: string;
  isAnonymous: boolean;
  text: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  author: string;
  authorEmail?: string;
  notificationsEnabled?: boolean;
  isAnonymous: boolean;
  date: string;
  imageUrl?: string;
  upvotes: number;
  upvotedByMe?: boolean;
  isMine?: boolean;
  comments: Comment[];
  adminNote?: string;
  adminUpdatedAt?: string;
}

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'prompt';
  text: string;
  timestamp: string;
}
