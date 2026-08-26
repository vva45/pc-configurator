export type TabSwipeGestureOwner = "tabs" | "horizontal-scroll" | "none";

const HORIZONTAL_SCROLL_SELECTOR = "[data-horizontal-scroll-zone]";
const INTERACTIVE_SELECTOR = [
  "button", "input", "select", "textarea", "a[href]", "[contenteditable='true']",
  "[role='button']", "[role='slider']", "[data-no-swipe]", "[data-no-tab-swipe]", "canvas",
].join(", ");

type ClosestTarget = { closest: (selector: string) => unknown };

function canFindClosest(target: EventTarget | null): target is EventTarget & ClosestTarget {
  return Boolean(target && typeof (target as Partial<ClosestTarget>).closest === "function");
}

/** Assigns ownership once, from the initial event target. */
export function getTabSwipeGestureOwner(target: EventTarget | null): TabSwipeGestureOwner {
  if (!canFindClosest(target)) return "none";
  if (target.closest(HORIZONTAL_SCROLL_SELECTOR)) return "horizontal-scroll";
  if (target.closest(INTERACTIVE_SELECTOR)) return "none";
  return "tabs";
}

export function isIntentionalTabSwipe(deltaX: number, deltaY: number) {
  const horizontalDistance = Math.abs(deltaX);
  return horizontalDistance >= 64 && horizontalDistance > Math.abs(deltaY) * 1.35;
}
