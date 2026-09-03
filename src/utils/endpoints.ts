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
  coupons: {
    list: '/admin/coupons',
    details: (id: string) => `/admin/coupons/${id}`,
    create: '/admin/coupons',
    update: (id: string) => `/admin/coupons/${id}`,
    delete: (id: string) => `/admin/coupons/${id}`,
  },
};
