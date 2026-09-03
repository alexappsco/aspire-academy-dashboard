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
  },
  coupons: {
    list: '/admin/coupons',
    details: (id: string) => `/admin/coupons/${id}`,
    create: '/admin/coupons',
    update: (id: string) => `/admin/coupons/${id}`,
    delete: (id: string) => `/admin/coupons/${id}`,
  },
};
