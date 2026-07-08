export interface Testimonial {
  id: string;
  authorName: string;
  quote: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SocialPost {
  id: string;
  imageUrl: string;
  caption: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  authorName: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}
