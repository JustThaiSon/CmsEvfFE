export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  DETAIL: {
    ROOT: "/detail",
    DETAIL1: "/detail/detail1",
    DETAIL2: "/detail/detail2",
  },
  CMS: "/cms",
  LOGIN: "/login",
} as const;

export const NAV_LINKS = [
  { key: "home" as const, href: ROUTES.HOME },
  { key: "about" as const, href: ROUTES.ABOUT },
  { key: "detail1" as const, href: ROUTES.DETAIL.DETAIL1 },
  { key: "detail2" as const, href: ROUTES.DETAIL.DETAIL2 },
  { key: "cms" as const, href: ROUTES.CMS },
] as const;

export const CMS_ROUTES = {
  DASHBOARD: "/cms",
  CONTACT_REQUESTS: "/cms/contact-requests",
  JOBS: "/cms/jobs",
  POSTS: "/cms/posts",
  CATEGORIES: "/cms/categories",
  PAGES: "/cms/pages",
  MEDIA: "/cms/media",
  SETTINGS: "/cms/settings",
} as const;

export const CMS_MENU_ITEMS = [
  { key: "contactRequests" as const, href: CMS_ROUTES.CONTACT_REQUESTS },
  { key: "jobs" as const, href: CMS_ROUTES.JOBS },
  { key: "posts" as const, href: CMS_ROUTES.POSTS },
  { key: "categories" as const, href: CMS_ROUTES.CATEGORIES },
] as const;

/** Trang mặc định sau đăng nhập CMS */
export const CMS_DEFAULT_ROUTE = CMS_ROUTES.JOBS;
