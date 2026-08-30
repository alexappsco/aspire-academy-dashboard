import { paths } from 'src/routes/paths';

// API
export const HOST_API =
  process.env.NEXT_PUBLIC_HOST_API ?? 'http://5.189.130.109:3000';
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.home; // as '/dashboar

export const COOKIES_KEYS = {
  lang: 'NEXT_LOCALE',
  session: 'accessToken',
  user: 'user',
  cart: 'cart',
};

export const MAX_FILE_SIZE = 500 * 1024; // 50KB
export const MAX_FILE_SIZE_HELPER = true;
