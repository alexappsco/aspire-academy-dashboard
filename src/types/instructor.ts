export type Currency = {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  code: string;
  symbol: string;
};

export type Country = {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  code?: string | null;
  currencyId?: string | null;
  currency?: Currency | null;
  order?: number;
  isActive?: boolean;
};

export type CountryListResponse = {
  totalCount: number;
  items: Country[];
};

export type University = {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  countryId?: string;
  country?: Country | null;
  order?: number;
  isActive?: boolean;
};

export type UniversityListResponse = {
  totalCount: number;
  items: University[];
};

export type Instructor = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  imageUrl?: string;
  bio?: string;
  title?: string;
  educationalQualification?: string;
  startJobAt?: string;
  countryId?: string;
  country?: Country | null;
  universityId?: string;
  university?: University | null;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
};

export type InstructorListResponse = {
  totalCount: number;
  items: Instructor[];
};

export type GetInstructorsParams = {
  IsVerified?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type GetCountriesParams = {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type GetUniversitiesParams = {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
};

export type CreateInstructorPayload = {
  Name: string;
  Email: string;
  PhoneNumber?: string;
  Password: string;
  CountryId?: string;
  ProfileImage?: File;
  Bio?: string;
  Title?: string;
  EducationalQualification?: string;
  StartJobAt?: string;
  UniversityId?: string;
};

export type UpdateInstructorPayload = {
  Name?: string;
  ProfileImage?: File;
  Bio?: string;
  Title?: string;
  EducationalQualification?: string;
  StartJobAt?: string;
  CountryId?: string;
  UniversityId?: string;
};