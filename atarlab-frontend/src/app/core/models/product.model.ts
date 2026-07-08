export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  children?: Category[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  sizeMl: number;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface FragranceNote {
  id: string;
  noteType: 'TOP' | 'MIDDLE' | 'BASE';
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  gender: 'MALE' | 'FEMALE' | 'UNISEX';
  concentration: string | null;
  longevity: string | null;
  projection: string | null;
  season: string[];
  occasion: string[];
  basePrice: string;
  isFeatured: boolean;
  avgRating: string;
  reviewCount: number;
  brand: Brand | null;
  category: Category | null;
  variants: ProductVariant[];
  images: ProductImage[];
  fragranceNotes?: FragranceNote[];
  ingredients?: { id: string; name: string }[];
  related?: Product[];
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: { fullName: string };
}
