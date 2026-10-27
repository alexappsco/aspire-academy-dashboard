import type { InstructorSubjectItem, DropdownOption } from 'src/types/instructor-subject';

export const MOCK_COLLEGES: DropdownOption[] = [
  { id: '1', label: 'الطب البشري' },
  { id: '2', label: 'كلية الطب' },
  { id: '3', label: 'كلية الصيدلة' },
  { id: '4', label: 'كلية طب الأسنان' },
  { id: '5', label: 'كلية العلوم الطبية' },
];

export const MOCK_SEMESTERS: DropdownOption[] = [
  { id: '1', label: 'الفصل الدراسي الاول' },
  { id: '2', label: 'الفصل الدراسي الثاني' },
  { id: '3', label: 'الفصل الدراسي الصيفي' },
];

export const MOCK_SUBJECT_CHOICES: DropdownOption[] = [
  { id: '1', label: 'علم التشريح' },
  { id: '2', label: 'التشريح' },
  { id: '3', label: 'علم وظائف الأعضاء' },
  { id: '4', label: 'الكيمياء الحيوية' },
  { id: '5', label: 'علم الأمراض' },
  { id: '6', label: 'علم الأدوية' },
  { id: '7', label: 'علم الأحياء الدقيقة' },
  { id: '8', label: 'علم المناعة' },
  { id: '9', label: 'علم الأنسجة' },
  { id: '10', label: 'الطب الباطني' },
];

export const INITIAL_MOCK_SUBJECTS: InstructorSubjectItem[] = [
  {
    id: 'subj-1',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-2',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-3',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-4',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-5',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-6',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-7',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-8',
    name: 'التشريح',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-9',
    name: 'علم وظائف الأعضاء',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الثاني',
    isActive: true,
  },
  {
    id: 'subj-10',
    name: 'الكيمياء الحيوية',
    college: 'كلية الصيدلة',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
  {
    id: 'subj-11',
    name: 'علم الأمراض',
    college: 'الطب البشري',
    semester: 'الفصل الدراسي الثاني',
    isActive: false,
  },
  {
    id: 'subj-12',
    name: 'علم الأدوية',
    college: 'كلية الصيدلة',
    semester: 'الفصل الدراسي الاول',
    isActive: true,
  },
];
