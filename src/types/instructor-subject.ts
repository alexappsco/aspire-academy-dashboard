export interface InstructorSubjectItem {
  id: string;
  name: string;
  college: string;
  semester: string;
  isActive: boolean;
  createdAt?: string;
}

export interface InstructorSubjectFormValues {
  college: string;
  semester: string;
  name: string;
  isActive: boolean;
}

export interface DropdownOption {
  id: string;
  label: string;
}
