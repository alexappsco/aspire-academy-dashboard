export const paths = {
  home: '/',
  hoursChargeRequests: {
    root: '/hours-charge-requests',
    details: (id: string) => `/hours-charge-requests/${id}`,
  },
  adminSessionRequests: {
    root: '/session-requests',
    details: (id: string) => `/session-requests/${id}`,
  },
  groupDiscountSettings: '/group-discount-settings',
};
