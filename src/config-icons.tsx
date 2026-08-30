import Iconify from './components/iconify';
import SvgColor from './components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/${name}.svg`} sx={{ width: '1em', height: '1em' }} />
);

export const ICONS = {
  navbar: {
    main: icon('navbar/ic_main'),
    categories: icon('navbar/ic_categories'),
    subCategories: icon('navbar/ic_subcategories'),
    products: icon('navbar/ic_products'),
    orders: icon('navbar/ic_orders'),
    marketings: icon('navbar/ic_marketings'),
  },
  global: {
    eye: icon('global/ic_eye'),
    eyeClosed: icon('global/ic_eye_closed'),
    edit: icon('global/ic_edit'),
    delete: icon('global/ic_delete'),
    link: icon('global/ic_link'),
    externalLink: icon('global/ic_external_link'),
    search: icon('global/ic_search'),
    x: icon('global/ic_x'),
    deleteCircle: icon('global/ic_delete_circle'),
    settingsRounded: icon('global/ic_settings_rounded'),
    longLeftArrow: icon('global/ic_long_left_arrow'),
    arrowBottom: <Iconify icon="eva:arrow-ios-downward-fill" width="1em" />,
    minus: <Iconify icon="mingcute:minimize-line" width="1em" />,
    add: <Iconify icon="mingcute:add-line" width="1em" />,
    redHeart: icon('global/red-heart'),
    grayHeart: icon('global/gray-heart'),
  },
};
