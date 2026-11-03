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

/** One faculty + academic year + semester a subject is taught in. academicYearId is null only on
 * subjects migrated from the old single faculty/semester fields where the year was ambiguous. */
export interface StudyMaterialPlacementDto {
  facultyId: string;
  facultyName?: string;
  academicYearId?: string | null;
  academicYearName?: string | null;
  semesterId: string;
  semesterName?: string;
}

export interface StudyMaterialPlacementInput {
  facultyId: string;
  academicYearId: string;
  semesterId: string;
}

export interface StudyMaterialDto {
  id: string;
  nameAr: string;
  nameEn: string;
  placements?: StudyMaterialPlacementDto[];
  /** First placement — kept by the API for older screens. */
  facultyId: string;
  facultyName?: string;
  faculty?: FacultyLookupDto;
  academicYearId?: string;
  academicYearName?: string;
  academicYear?: AcademicYearLookupDto;
  semesterId: string;
  semesterName?: string;
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
  placements: StudyMaterialPlacementInput[];
  isActive: boolean;
}

export interface UpdateStudyMaterialDto {
  nameAr: string;
  nameEn: string;
  placements: StudyMaterialPlacementInput[];
  isActive: boolean;
}

