export interface Course {
  id: string;
  title_ar: string;
  title_en: string;
  lecturer_ar: string;
  lecturer_en: string;
  specialty_ar: string;
  specialty_en: string;
  students: number;
  rating: number;
  price: number;
  status: 'active' | 'paused';
  lastUpdate_ar: string;
  lastUpdate_en: string;
}

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title_ar: 'اساسيات امراض القلب',
    title_en: 'Cardiology Basics',
    lecturer_ar: 'د. احمد محمود',
    lecturer_en: 'Dr. Ahmed Mahmoud',
    specialty_ar: 'امراض القلب',
    specialty_en: 'Cardiology',
    students: 1245,
    rating: 4.8,
    price: 150,
    status: 'active',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '2',
    title_ar: 'علم الاعصاب السريري',
    title_en: 'Clinical Neurology',
    lecturer_ar: 'د. سارة خليل',
    lecturer_en: 'Dr. Sara Khalil',
    specialty_ar: 'طب الاعصاب',
    specialty_en: 'Neurology',
    students: 1245,
    rating: 4.8,
    price: 249,
    status: 'active',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '3',
    title_ar: 'اساسيات امراض القلب',
    title_en: 'Cardiology Basics',
    lecturer_ar: 'د. احمد محمود',
    lecturer_en: 'Dr. Ahmed Mahmoud',
    specialty_ar: 'امراض القلب',
    specialty_en: 'Cardiology',
    students: 1245,
    rating: 4.8,
    price: 150,
    status: 'active',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '4',
    title_ar: 'اساسيات امراض القلب',
    title_en: 'Cardiology Basics',
    lecturer_ar: 'د. احمد محمود',
    lecturer_en: 'Dr. Ahmed Mahmoud',
    specialty_ar: 'امراض القلب',
    specialty_en: 'Cardiology',
    students: 1245,
    rating: 4.8,
    price: 150,
    status: 'paused',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '5',
    title_ar: 'اساسيات امراض القلب',
    title_en: 'Cardiology Basics',
    lecturer_ar: 'د. احمد محمود',
    lecturer_en: 'Dr. Ahmed Mahmoud',
    specialty_ar: 'امراض القلب',
    specialty_en: 'Cardiology',
    students: 1245,
    rating: 4.8,
    price: 150,
    status: 'active',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '6',
    title_ar: 'اساسيات امراض القلب',
    title_en: 'Cardiology Basics',
    lecturer_ar: 'د. احمد محمود',
    lecturer_en: 'Dr. Ahmed Mahmoud',
    specialty_ar: 'امراض القلب',
    specialty_en: 'Cardiology',
    students: 1245,
    rating: 4.8,
    price: 150,
    status: 'active',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '7',
    title_ar: 'اساسيات امراض القلب',
    title_en: 'Cardiology Basics',
    lecturer_ar: 'د. احمد محمود',
    lecturer_en: 'Dr. Ahmed Mahmoud',
    specialty_ar: 'امراض القلب',
    specialty_en: 'Cardiology',
    students: 1245,
    rating: 4.8,
    price: 150,
    status: 'active',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '8',
    title_ar: 'اساسيات امراض القلب',
    title_en: 'Cardiology Basics',
    lecturer_ar: 'د. احمد محمود',
    lecturer_en: 'Dr. Ahmed Mahmoud',
    specialty_ar: 'امراض القلب',
    specialty_en: 'Cardiology',
    students: 1245,
    rating: 4.8,
    price: 150,
    status: 'paused',
    lastUpdate_ar: '27 أغسطس 2026',
    lastUpdate_en: '27 August 2026',
  },
  {
    id: '9',
    title_ar: 'علم الاعصاب السريري',
    title_en: 'Clinical Neurology',
    lecturer_ar: 'د. سارة خليل',
    lecturer_en: 'Dr. Sara Khalil',
    specialty_ar: 'طب الاعصاب',
    specialty_en: 'Neurology',
    students: 950,
    rating: 4.5,
    price: 249,
    status: 'active',
    lastUpdate_ar: '25 أغسطس 2026',
    lastUpdate_en: '25 August 2026',
  },
  {
    id: '10',
    title_ar: 'مقدمة في طب الطوارئ',
    title_en: 'Emergency Medicine',
    lecturer_ar: 'د. خالد العتيبي',
    lecturer_en: 'Dr. Khaled Al-Otaibi',
    specialty_ar: 'طب الطوارئ',
    specialty_en: 'Emergency Medicine',
    students: 800,
    rating: 4.7,
    price: 120,
    status: 'active',
    lastUpdate_ar: '20 أغسطس 2026',
    lastUpdate_en: '20 August 2026',
  },
  {
    id: '11',
    title_ar: 'أساسيات الجراحة العامة',
    title_en: 'General Surgery Basics',
    lecturer_ar: 'د. محمد علي',
    lecturer_en: 'Dr. Mohamed Ali',
    specialty_ar: 'جراحة عامة',
    specialty_en: 'General Surgery',
    students: 1500,
    rating: 4.9,
    price: 300,
    status: 'active',
    lastUpdate_ar: '15 أغسطس 2026',
    lastUpdate_en: '15 August 2026',
  },
  {
    id: '12',
    title_ar: 'طب الأطفال الشامل',
    title_en: 'Pediatric Care',
    lecturer_ar: 'د. فاطمة الزهراء',
    lecturer_en: 'Dr. Fatima Zahra',
    specialty_ar: 'طب الأطفال',
    specialty_en: 'Pediatrics',
    students: 1100,
    rating: 4.6,
    price: 180,
    status: 'paused',
    lastUpdate_ar: '10 أغسطس 2026',
    lastUpdate_en: '10 August 2026',
  },
];

export const MOCK_LECTURERS = [
  { value: 'ahmed_mahmoud', label_ar: 'د. أحمد محمود', label_en: 'Dr. Ahmed Mahmoud' },
  { value: 'sara_khalil', label_ar: 'د. سارة خليل', label_en: 'Dr. Sara Khalil' },
  { value: 'khaled_otaibi', label_ar: 'د. خالد العتيبي', label_en: 'Dr. Khaled Al-Otaibi' },
  { value: 'mohamed_ali', label_ar: 'د. محمد علي', label_en: 'Dr. Mohamed Ali' },
  { value: 'fatima_zahra', label_ar: 'د. فاطمة الزهراء', label_en: 'Dr. Fatima Zahra' },
];

export const MOCK_COLLEGES = [
  { value: 'medicine', label_ar: 'كلية الطب البشري', label_en: 'Faculty of Medicine' },
  { value: 'pharmacy', label_ar: 'كلية الصيدلة', label_en: 'Faculty of Pharmacy' },
  { value: 'dentistry', label_ar: 'كلية طب الأسنان', label_en: 'Faculty of Dentistry' },
  { value: 'nursing', label_ar: 'كلية التمريض', label_en: 'Faculty of Nursing' },
];

export const MOCK_SUBJECTS = [
  { value: 'anatomy', label_ar: 'علم التشريح', label_en: 'Anatomy' },
  { value: 'physiology', label_ar: 'علم وظائف الأعضاء', label_en: 'Physiology' },
  { value: 'pathology', label_ar: 'علم الأمراض', label_en: 'Pathology' },
  { value: 'pharmacology', label_ar: 'علم الأدوية', label_en: 'Pharmacology' },
];

export const MOCK_SPECIALTIES = [
  { value: 'cardiology', label_ar: 'أمراض القلب', label_en: 'Cardiology' },
  { value: 'neurology', label_ar: 'طب الأعصاب', label_en: 'Neurology' },
  { value: 'surgery', label_ar: 'الجراحة العامة', label_en: 'General Surgery' },
  { value: 'pediatrics', label_ar: 'طب الأطفال', label_en: 'Pediatrics' },
];

export const MOCK_CATEGORIES = [
  { value: 'clinical', label_ar: 'علوم سريرية', label_en: 'Clinical Sciences' },
  { value: 'basic', label_ar: 'علوم أساسية', label_en: 'Basic Sciences' },
  { value: 'practical', label_ar: 'تدريب عملي', label_en: 'Practical Training' },
];

export const MOCK_FIELDS = [
  { value: 'medical', label_ar: 'المجال الطبي', label_en: 'Medical Field' },
  { value: 'health', label_ar: 'الرعاية الصحية', label_en: 'Healthcare' },
  { value: 'research', label_ar: 'الأبحاث الطبية', label_en: 'Medical Research' },
];

export const INITIAL_CHAPTERS = [
  {
    id: 'ch-1',
    title: 'الفصل الأول - مقدمة',
    isExpanded: true,
    lessons: [
      { id: 'les-1', title: 'الدرس الأول', hasVideo: true, videoName: 'intro_part1.mp4' },
      { id: 'les-2', title: 'الدرس الثاني', hasVideo: true, videoName: 'intro_part2.mp4' },
      { id: 'les-3', title: 'الدرس الثالث', hasVideo: false },
    ],
  },
  {
    id: 'ch-2',
    title: 'الفصل الأول - أساسيات',
    isExpanded: false,
    lessons: [
      { id: 'les-4', title: 'الدرس الأول', hasVideo: true, videoName: 'basics_1.mp4' },
      { id: 'les-5', title: 'الدرس الثاني', hasVideo: true, videoName: 'basics_2.mp4' },
      { id: 'les-6', title: 'الدرس الثالث', hasVideo: true, videoName: 'basics_3.mp4' },
    ],
  },
];

