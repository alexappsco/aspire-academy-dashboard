export const endpoints = {
  countries: {
    list: '/admin/countries',
    details: (id: string) => `/admin/countries/${id}`,
    create: '/admin/countries',
    update: (id: string) => `/admin/countries/${id}`,
    delete: (id: string) => `/admin/countries/${id}`,
  },
  currencies: {
    list: '/admin/currencies',
    details: (id: string) => `/admin/currencies/${id}`,
    create: '/admin/currencies',
    update: (id: string) => `/admin/currencies/${id}`,
    delete: (id: string) => `/admin/currencies/${id}`,
  },
  instructors: {
    list: '/admin/instructors',
    details: (id: string) => `/admin/instructors/${id}`,
    create: '/admin/instructors',
    update: (id: string) => `/admin/instructors/${id}`,
    delete: (id: string) => `/admin/instructors/${id}`,
    verify: (id: string) => `/admin/instructors/${id}/verify`,
    reject: (id: string) => `/admin/instructors/${id}/reject`,
  },
  universities: {
    list: '/admin/universities',
    details: (id: string) => `/admin/universities/${id}`,
    create: '/admin/universities',
    update: (id: string) => `/admin/universities/${id}`,
    delete: (id: string) => `/admin/universities/${id}`,
  },
  coupons: {
    list: '/admin/coupons',
    details: (id: string) => `/admin/coupons/${id}`,
    create: '/admin/coupons',
    update: (id: string) => `/admin/coupons/${id}`,
    delete: (id: string) => `/admin/coupons/${id}`,
  },
  studyMaterials: {
    list: '/admin/study-materials',
    details: (id: string) => `/admin/study-materials/${id}`,
    create: '/admin/study-materials',
    update: (id: string) => `/admin/study-materials/${id}`,
    delete: (id: string) => `/admin/study-materials/${id}`,
  },
  faculties: {
    list: '/admin/faculties',
  },
  semesters: {
    list: '/admin/semesters',
  },
  academicYear:{
    list: '/admin/academic-years',
    create: '/admin/academic-years',
    details: (id: string) => `/admin/academic-years/${id}`,
    update: (id: string) => `/admin/academic-years/${id}`,
    delete: (id: string) => `/admin/academic-years/${id}`,
  },
  semester:{
    list: '/admin/semesters',
    create: '/admin/semesters',
    details: (id: string) => `/admin/semesters/${id}`,
    update: (id: string) => `/admin/semesters/${id}`,
    delete: (id: string) => `/admin/semesters/${id}`,
  }
};
