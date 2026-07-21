import {
  ArrowLeft,
  Check,
  CircleCheck,
  Gamepad2,
  Heart,
  Library,
  LogOut,
  Menu,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Trash2,
  User,
  X,
  createElement,
} from "lucide";

export const icons = Object.freeze({
  arrowLeft: ArrowLeft,
  check: Check,
  circleCheck: CircleCheck,
  gamepad: Gamepad2,
  heart: Heart,
  library: Library,
  logOut: LogOut,
  menu: Menu,
  play: Play,
  reset: RotateCcw,
  search: Search,
  settings: Settings,
  shoppingCart: ShoppingCart,
  star: Star,
  trash: Trash2,
  user: User,
  x: X,
});

export function Icon(
  icon,
  { className = "w-5 h-5", label, strokeWidth = 2, fill = "none" } = {}
) {
  const accessibilityAttributes = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": "true" };

  return createElement(icon, {
    class: className,
    fill,
    "stroke-width": strokeWidth,
    focusable: "false",
    ...accessibilityAttributes,
  }).outerHTML;
}
