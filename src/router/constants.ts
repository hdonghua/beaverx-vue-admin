export const WHITE_LIST = [
  { name: 'notFound', children: [] },
  { name: 'login', children: [] },
  { name: 'Home', children: [] },
  { name: 'Setting', children: [] },
];

/** 无需拉取服务端菜单的路由（白名单路由仍可能需要菜单，如 Home） */
export const MENU_FETCH_SKIP_ROUTES = ['login', 'notFound'];

export const NOT_FOUND = {
  name: 'notFound',
};

export const REDIRECT_ROUTE_NAME = 'Redirect';

export const DEFAULT_ROUTE_NAME = 'Home';

export const DEFAULT_ROUTE = {
  title: 'menu.home',
  name: DEFAULT_ROUTE_NAME,
  fullPath: '/home',
};
