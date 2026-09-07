export interface BannerDto {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  startAt: string;
  endAt: string;
  courseId?: string | null;
  packageId?: string | null;
  externalUrl?: string | null;
  creationTime?: string;
}

export interface BannerListResponse {
  totalCount: number;
  items: BannerDto[];
}

export interface GetBannersParams {
  Filter?: string;
  IsActive?: boolean;
  StartDate?: string;
  EndDate?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface CreateBannerDto {
  nameAr: string;
  nameEn: string;
  image?: File | Blob | null;
  order?: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
  courseId?: string | null;
  packageId?: string | null;
  externalUrl?: string | null;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {}
