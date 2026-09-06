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
