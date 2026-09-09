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

// ==========================================
// Instructor Details UI Domain Types
// ==========================================

export interface InstructorProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  imageUrl?: string;
  avatarInitials: string;
  isActive: boolean;
  rating: number;
  ratingCount: number;
  joinedDate: string;
  email: string;
  phoneNumber: string;
  country: string;
  university: string;
  qualification: string;
  bio: string;
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  studentsGrowth: string;
  trainingHours: number;
  totalSales: number;
  currency: string;
  satisfactionRate: number;
}

export interface InstructorCourseItem {
  id: string;
  title: string;
  specialty: string;
  studentsCount: number;
  rating: number;
  price: number;
  currency: string;
  status: 'active' | 'paused';
  statusText: string;
  lastUpdated: string;
}

export interface InstructorSubscriptionRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  studentInitials: string;
  studentPhone: string;
  courseTitle: string;
  courseCategory: string;
  requestDate: string;
  status: 'approved' | 'pending' | 'rejected';
  statusText: string;
  orderNumber: string;
  amount: string;
}

export interface InstructorReviewItem {
  id: string;
  studentName: string;
  studentEmail: string;
  studentInitials: string;
  courseTitle: string;
  courseCategory: string;
  courseRating: number;
  courseComment: string;
  instructorRating: number;
  instructorComment: string;
  reviewDate: string;
}