export interface FacultyLookupDto {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
}

export interface AcademicYearLookupDto {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
}

export interface SemesterLookupDto {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
}

export interface StudyMaterialDto {
  id: string;
  nameAr: string;
  nameEn: string;
  facultyId: string;
  faculty?: FacultyLookupDto;
  academicYearId?: string;
  academicYear?: AcademicYearLookupDto;
  semesterId: string;
  semester?: SemesterLookupDto;
  isActive: boolean;
  creationTime?: string;
}

export interface StudyMaterialsListResponse {
  items: StudyMaterialDto[];
  totalCount: number;
}

export interface GetStudyMaterialsParams {
  IsActive?: boolean;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
  FacultyId?: string;
  AcademicYearId?: string;
  SemesterId?: string;
}

export interface CreateStudyMaterialDto {
  nameAr: string;
  nameEn: string;
  facultyId: string;
  academicYearId?: string;
  semesterId: string;
  isActive: boolean;
}

export interface UpdateStudyMaterialDto {
  nameAr: string;
  nameEn: string;
  facultyId: string;
  academicYearId?: string;
  semesterId: string;
  isActive: boolean;
}

