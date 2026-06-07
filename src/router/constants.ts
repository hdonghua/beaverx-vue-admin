export const REDIRECT_ROUTE_NAME = 'Redirect';

export const WHITE_LIST = [
  { name: 'notFound', children: [] },
  { name: 'login', children: [] },
  { name: 'Home', children: [] },
  { name: 'Setting', children: [] },
  { name: '403', children: [] },
  { name: '404', children: [] },
  { name: '500', children: [] },
  { name: 'redirectWrapper', children: [] },
  { name: REDIRECT_ROUTE_NAME, children: [] },
];

/** 无需鉴权菜单、可直接访问的路由 name */
export const ROUTE_ACCESS_WHITE_LIST = WHITE_LIST.map((item) => item.name);

/** 无需拉取服务端菜单的路由（白名单路由仍可能需要菜单，如 Home） */
export const MENU_FETCH_SKIP_ROUTES = ['login', 'notFound'];

export const NOT_FOUND = {
  name: 'notFound',
};

export const FORBIDDEN = {
  name: '403',
};

export const DEFAULT_ROUTE_NAME = 'Home';

export const DEFAULT_ROUTE = {
  title: 'menu.home',
  name: DEFAULT_ROUTE_NAME,
  fullPath: '/home',
};
