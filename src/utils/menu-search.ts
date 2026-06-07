import type { RouteRecordRaw } from 'vue-router';

export interface MenuSearchItem {
  name: string;
  path: string;
  title: string;
  breadcrumb: string;
  icon?: string;
  keywords: string;
}

export function flattenMenuForSearch(
  routes: RouteRecordRaw[],
  getTitle: (route: RouteRecordRaw) => string,
  parentTitles: string[] = [],
  parentIcon?: string
): MenuSearchItem[] {
  const result: MenuSearchItem[] = [];

  routes.forEach((route) => {
    const title = getTitle(route);
    const breadcrumbParts = [...parentTitles, title];
    const icon = (route.meta?.icon as string | undefined) || parentIcon;
    const isLeaf = !route.children?.length;

    if (isLeaf && route.name) {
      const breadcrumb = parentTitles.join(' / ');
      result.push({
        name: String(route.name),
        path: route.path,
        title,
        breadcrumb,
        icon,
        keywords: [
          title,
          breadcrumb,
          route.path,
          String(route.name),
        ]
          .join(' ')
          .toLowerCase(),
      });
      return;
    }

    if (route.children?.length) {
      result.push(
        ...flattenMenuForSearch(
          route.children,
          getTitle,
          breadcrumbParts,
          icon
        )
      );
    }
  });

  return result;
}

export function filterMenuSearchItems(
  items: MenuSearchItem[],
  keyword: string
): MenuSearchItem[] {
  const query = keyword.trim().toLowerCase();
  if (!query) {
    return items;
  }
  return items.filter((item) => item.keywords.includes(query));
}
