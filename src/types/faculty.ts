export type FacultyAcademicYear = {
  id: string;
  name: string;
};

export type FacultyUniversity = {
  id: string;
  name: string;
};

export type Faculty = {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  universityId: string;
  university?: FacultyUniversity;
  academicYears?: FacultyAcademicYear[];
  isActive: boolean;
};

export type FacultyListResponse = {
  items: Faculty[];
  totalCount: number;
};

export interface GetFacultiesParams {
  IsActive?: boolean;
  UniversityId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export interface CreateFacultyPayload {
  nameAr: string;
  nameEn: string;
  universityId: string;
  academicYearIds?: string[];
  isActive: boolean;
  image?: File | null;
}

export interface UpdateFacultyPayload {
  nameAr: string;
  nameEn: string;
  universityId: string;
  academicYearIds?: string[];
  isActive: boolean;
  image?: File | null;
}
