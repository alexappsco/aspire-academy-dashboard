/**
 * TEMP: Backend still expects `order`.
 * If the API drops this field, remove TEMP_ORDER and every usage marked with TEMP_ORDER.
 */
export const TEMP_ORDER = 0;

export type AcademicYearItem = {
  id: string;
  nameAr: string;
  nameEn: string;
  order: number;
  faculties?: { id: string; name: string }[];
  semesters?: { id: string; name: string }[];
  isActive: boolean;
};

export type AcademicYearsListResponse = {
  totalCount: number;
  items: AcademicYearItem[];
};

export type AcademicYearFormValues = {
  nameAr: string;
  nameEn: string;
  facultyIds: string[];
  semesterIds: string[];
  isActive: boolean;
};

/** Payload sent to create/update. facultyIds/semesterIds are the full set of links — always send them,
 * an empty list unlinks everything. */
export type AcademicYearPayload = {
  nameAr: string;
  nameEn: string;
  facultyIds: string[];
  semesterIds: string[];
  /** @see TEMP_ORDER — remove when backend no longer requires order */
  order: number;
  isActive: boolean;
};
