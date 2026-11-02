export type PackageCourse = {
  courseId: string;
  title?: string | null;
  imageUrl?: string | null;
  price: number;
  instructorId: string;
  instructorName?: string | null;
  specializationId: string;
  specializationName?: string | null;
  addedAt: string;
};

export type PackageSummary = {
  id: string;
  nameAr?: string | null;
  nameEn?: string | null;
  imageUrl?: string | null;
  coursesCount: number;
  subscribersCount: number;
  originalPrice: number;
  price: number;
  coursesTotalPrice: number;
  discount: number;
  discountPercentage: number;
  currencyCode?: string | null;
  currencySymbol?: string | null;
  isActive: boolean;
  creationTime: string;
  courses?: PackageCourse[] | null;
};

export type PackageListResponse = {
  items: PackageSummary[];
  totalCount: number;
};

export type PackageFormValues = {
  nameAr: string;
  nameEn: string;
  image: File | string | null;
  courseIds: string[];
  discountedPrice: string;
  isActive: boolean;
};

export type GetPackagesParams = {
  SpecializationId?: string;
  CoursesCount?: number;
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};
