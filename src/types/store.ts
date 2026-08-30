export interface StorePromotion {
  id: string;
  start_date: string;
  end_date: string;
}

export interface StoreBranch {
  id: string;
  number: string;
  name: string;
  is_main_branch: boolean;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  logo: string | null;
  catalogue: string | null;
  cover_image: string | null;
  first_phone: string | null;
  second_phone: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  x_link: string | null;
  offers_count: number;
  is_active: boolean;
  description: string | null;
  views: number;
  status: string;
  whatsapp_link: string | null;
  snapchat_link: string | null;
  youtube_link: string | null;
  website_link: string | null;
  city_id: string;
  city: StoreCity;
  is_online: boolean;
  store_type: string;
  distance: null;
  offers: StoreOffer[];
  subcategory: StoreSubcategory;
  email: string | null;
  promotion?: StorePromotion | null;
}

export interface StoreCity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  name_ar?: string;
  name_en?: string;
  country_id: string | null;
  order_by: number;
}

export interface StoreOffer {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  offer_percentage: string;
  code: string;
  is_active: boolean;
  views: number;
  is_special: boolean;
  distance: null;
}

export interface StoreSubcategory {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  logo: string;
  order_by: number;
  is_active: boolean;
}

export interface StoreCategory {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  logo?: string;
  order_by?: number;
  is_active?: boolean;
}

export interface StoreProfile {
  id: string;
  number: string;
  name: string;
  is_main_branch: boolean;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  logo: string | null;
  catalogue: string | null;
  cover_image: string | null;
  commercial_registration: string | null;
  vat_certificate: string | null;
  first_phone: string | null;
  second_phone: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  x_link: string | null;
  tiktok_link: string | null;
  is_active: boolean;
  description: string | null;
  views: number;
  status: string;
  whatsapp_link: string | null;
  snapchat_link: string | null;
  youtube_link: string | null;
  website_link: string | null;
  city_id: string;
  city: StoreCity;
  is_online: boolean;
  store_type: string;
  distance: null;
  subcategory: StoreSubcategory;
  email: string | null;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  website_link?: string;
  first_phone?: string;
  second_phone?: string;
  facebook_link?: string;
  instagram_link?: string;
  x_link?: string;
  whatsapp_link?: string;
  snapchat_link?: string;
  youtube_link?: string;
  tiktok_link?: string;
  city_id?: string;
  category_id?: string;
  is_active?: boolean;
  logo?: File | null;
  catalogue?: File | null;
  cover_image?: File | null;
  commercial_registration?: File | null;
  vat_certificate?: File | null;
}

export interface ApiListResponse<T> {
  data: T[];
  message: string;
  statusCode: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiSingleResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface Branch {
  id: string;
  branchNumber: string;
  name: string;
  address: string;
  number: string;
  status: "active" | "inactive";
  logo?: string | null;
  cover_image?: string | null;
  description?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  city_id?: string | null;
  is_active?: boolean;
  promotion?: StorePromotion | null;
}

export interface CreateBranchFormData {
  number: string;
  name: string;
  email?: string;
  address: string;
  description?: string;
  status: "active" | "inactive";
  latitude: number;
  longitude: number;
  city_id: string;
}

export interface UpdateBranchFormData extends CreateBranchFormData {
  id: string;
}
