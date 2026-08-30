// ----------------------------------------------------------------------

export function flattenArray<T>(list: T[], key = 'children'): T[] {
  let children: T[] = [];

  const flatten = list?.map((item: T) => {
    const childItems = (item as Record<string, unknown>)[key];
    if (Array.isArray(childItems) && childItems.length) {
      children = [...children, ...childItems] as T[];
    }
    return item;
  });

  return flatten?.concat(children.length ? flattenArray(children, key) : children);
}
