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
};
