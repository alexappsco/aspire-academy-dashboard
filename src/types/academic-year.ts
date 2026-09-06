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
  isActive: boolean;
};

export type AcademicYearsListResponse = {
  totalCount: number;
  items: AcademicYearItem[];
};

export type AcademicYearFormValues = {
  nameAr: string;
  nameEn: string;
  isActive: boolean;
};

/** Payload sent to create/update — no facultyIds / semesterIds */
export type AcademicYearPayload = {
  nameAr: string;
  nameEn: string;
  /** @see TEMP_ORDER — remove when backend no longer requires order */
  order: number;
  isActive: boolean;
};
