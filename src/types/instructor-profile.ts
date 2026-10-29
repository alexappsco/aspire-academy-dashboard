export type InstructorProfileDto = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  imageUrl?: string | null;
  title?: string | null;
  bio?: string | null;
  educationalQualification?: string | null;
  startJobAt?: string | null;
  countryId?: string | null;
  countryName?: string | null;
  universityId?: string | null;
  universityName?: string | null;
  specializationIds?: string[];
  specializationNames?: string[];
  studyMaterialIds?: string[];
  studyMaterialNames?: string[];
  isVerified?: boolean;
};

export type UpdateInstructorProfilePayload = {
  Name: string;
  Email: string;
  PhoneNumber?: string;
  NewPassword?: string;
  ConfirmNewPassword?: string;
  Title?: string;
  Bio?: string;
  EducationalQualification?: string;
  StartJobAt?: string;
  CountryId?: string;
  UniversityId?: string;
  SpecializationIds?: string[];
  StudyMaterialIds?: string[];
  ProfileImage?: File;
};

export type InstructorAssignedStudyMaterial = {
  id: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  facultyId?: string;
  facultyName?: string;
  academicYearId?: string;
  academicYearName?: string;
  semesterId?: string;
  semesterName?: string;
  isActive?: boolean;
};

export type InstructorLookupItem = {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  code?: string | null;
  isActive?: boolean;
};

export type InstructorLookupListResponse = {
  items: InstructorLookupItem[];
  totalCount: number;
};

export type UpdateInstructorStudyMaterialsPayload = {
  studyMaterialIds: string[];
};
