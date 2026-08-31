export interface QuestionItem {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  active: boolean;
}

export const MOCK_QUESTIONS: QuestionItem[] = [
  {
    id: '1',
    question_ar: 'ما هي الدورات؟',
    question_en: 'What are the courses?',
    answer_ar: 'يمكنك البحث عن الدورات واستعراضها من خلال صفحة الدورات التعليمية.',
    answer_en: 'You can search for and browse courses from the courses page.',
    active: true,
  },
  {
    id: '2',
    question_ar: 'ما هي المنافع؟',
    question_en: 'What are the benefits?',
    answer_ar: 'تتضمن المنافع الوصول إلى جميع الدورات والشهادات المعتمدة.',
    answer_en: 'Benefits include access to all courses and certified certificates.',
    active: true,
  },
  {
    id: '3',
    question_ar: 'كيف تشتري الدورات؟',
    question_en: 'How do you purchase courses?',
    answer_ar: 'يمكنك شراء الدورات عن طريق إضافتها إلى سلة المشتارات وإتمام عملية الدفع.',
    answer_en: 'You can purchase courses by adding them to the cart and completing the payment process.',
    active: true,
  },
  {
    id: '4',
    question_ar: 'كيف يمكنني رؤية أفضل دورة؟',
    question_en: 'How can I find the best course?',
    answer_ar: 'يمكنك تصفح التقييمات والمراجعات لاختيار أفضل دورة تناسب احتياجاتك.',
    answer_en: 'You can browse ratings and reviews to choose the best course for your needs.',
    active: false,
  },
  {
    id: '5',
    question_ar: 'هل يمكنني استرجاع المبلغ؟',
    question_en: 'Can I get a refund?',
    answer_ar: 'نعم، يمكنك استرجاع المبلغ خلال 30 يوماً من تاريخ الشراء.',
    answer_en: 'Yes, you can get a refund within 30 days of purchase.',
    active: true,
  },
  {
    id: '6',
    question_ar: 'كيف أحصل على الشهادة؟',
    question_en: 'How do I get the certificate?',
    answer_ar: 'تحصل على الشهادة إتمام الدورة بنجاح واجتياز الاختبار النهائي.',
    answer_en: 'You get the certificate upon successful completion of the course and passing the final exam.',
    active: true,
  },
  {
    id: '7',
    question_ar: 'هل الدورات متاحة بالعربية؟',
    question_en: 'Are the courses available in Arabic?',
    answer_ar: 'نعم، جميع الدورات متاحة باللغة العربية والإنجليزية.',
    answer_en: 'Yes, all courses are available in both Arabic and English.',
    active: true,
  },
  {
    id: '8',
    question_ar: 'كيف أتواصل مع الدعم الفني؟',
    question_en: 'How do I contact technical support?',
    answer_ar: 'يمكنك التواصل معنا من خلال صفحة الدعم الفني أو عبر البريد الإلكتروني.',
    answer_en: 'You can contact us through the support page or via email.',
    active: false,
  },
];
