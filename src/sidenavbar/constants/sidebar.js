export const NAV_TABS = [
  {
    id: "catalog",
    label: "Catalog",
    actions: ["cart", "filter", "sort", "wishlist"],
  },
  {
    id: "orders",
    label: "Orders",
    actions: ["filter", "sort"],
  },
  {
    id: "profile",
    label: "Profile",
    actions: [],
  },
];

export const ACTION_CONFIG = {
  cart: {
    id: "cart",
    label: "Cart",
    icon: "🛒",
  },
  filter: {
    id: "filter",
    label: "Filter",
    icon: "🔍",
  },
  sort: {
    id: "sort",
    label: "Sort",
    icon: "⬇️",
  },
  wishlist: {
    id: "wishlist",
    label: "Wishlist",
    icon: "⭐",
  },
};