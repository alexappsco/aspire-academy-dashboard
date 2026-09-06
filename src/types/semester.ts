/**
 * TEMP: Backend still expects `order`.
 * If the API drops this field, remove TEMP_ORDER and every usage marked with TEMP_ORDER.
 */
export const TEMP_ORDER = 0;

export type AcademicSemesterItem = {
  id: string;
  nameAr: string;
  nameEn: string;
  order: number;
  isActive: boolean;
};

export type AcademicSemestersListResponse = {
  totalCount: number;
  items: AcademicSemesterItem[];
};

export type AcademicSemesterFormValues = {
  nameAr: string;
  nameEn: string;
  isActive: boolean;
};

/** Payload sent to create/update — no facultyIds / semesterIds */
export type AcademicSemesterPayload = {
  nameAr: string;
  nameEn: string;
  /** @see TEMP_ORDER — remove when backend no longer requires order */
  order: number;
  isActive: boolean;
};
