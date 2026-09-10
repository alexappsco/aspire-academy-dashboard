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
  ratingAverage?: number;
  ratingCount?: number;
  coursesCount?: number;
  activeCoursesCount?: number;
  studentsCount?: number;
  totalSales?: number;
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

// ==========================================
// API Response Types (matching backend)
// ==========================================

export type InstructorCourseApiResponse = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: string;
  price: number;
  oldPrice: number;
  currencyId: string;
  currency: Currency | null;
  specializationId: string;
  specialization: { id: string; name: string } | null;
  facultyId: string;
  faculty: { id: string; name: string } | null;
  studyMaterialId: string;
  studyMaterial: { id: string; name: string } | null;
  instructorId: string;
  instructor: { id: string; name: string; title: string; imageUrl: string | null } | null;
  fieldId: string;
  field: { id: string; name: string; imageUrl: string } | null;
  status: string;
  rejectionReason: string | null;
  accessDurationInDays: number;
  reviewedAt: string | null;
  lastUpdatedAt: string;
  ratingAverage: number;
  ratingCount: number;
  studentsCount: number;
  lessonCount: number;
  totalDurationInSeconds: number;
  objectives: { id: string; text: string; order: number }[];
  curriculum: unknown;
};

export type InstructorCourseListResponse = {
  totalCount: number;
  items: InstructorCourseApiResponse[];
};

export type InstructorOrderApiResponse = {
  id: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  status: string;
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  appliedCouponCode: string | null;
  receiptUrl: string | null;
  receiptVerified: boolean;
  items: {
    id: string;
    price: number;
    courseId: string;
    courseTitle: string;
    packageId: string | null;
    packageName: string | null;
  }[];
  creationTime: string;
};

export type InstructorOrderListResponse = {
  totalCount: number;
  items: InstructorOrderApiResponse[];
};

export type InstructorReviewApiResponse = {
  id: string;
  studentId: string;
  studentName: string;
  studentImageUrl: string | null;
  courseId: string;
  courseTitle: string;
  instructorRate: number;
  instructorComment: string;
  courseRate: number;
  courseComment: string;
  createdAt: string;
};

export type InstructorReviewListResponse = {
  totalCount: number;
  items: InstructorReviewApiResponse[];
};

export type GetInstructorSubDataParams = {
  SkipCount?: number;
  MaxResultCount?: number;
};

// ==========================================
// Legacy UI Types (kept for compatibility)
// ==========================================

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