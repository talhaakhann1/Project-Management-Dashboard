"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type React from "react";
import { cn } from "@/lib/utils";

// Root
export const Menu: typeof MenuPrimitive.Root = MenuPrimitive.Root;

// Trigger
export const MenuTrigger: typeof MenuPrimitive.Trigger =
  MenuPrimitive.Trigger;

// Separator
export function MenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props): React.ReactElement {
  return (
    <MenuPrimitive.Separator
      className={cn("my-1 h-px bg-border", className)}
      data-slot="menu-separator"
      {...props}
    />
  );
}

// Group
export function MenuGroup({
  className,
  ...props
}: MenuPrimitive.Group.Props): React.ReactElement {
  return (
    <MenuPrimitive.Group
      className={cn("p-1", className)}
      data-slot="menu-group"
      {...props}
    />
  );
}

// GroupLabel
export function MenuGroupLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props): React.ReactElement {
  return (
    <MenuPrimitive.GroupLabel
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
        className,
      )}
      data-slot="menu-group-label"
      {...props}
    />
  );
}

// Item
export function MenuItem({
  className,
  ...props
}: MenuPrimitive.Item.Props): React.ReactElement {
  return (
    <MenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      data-slot="menu-item"
      {...props}
    />
  );
}

// CheckboxItem
export function MenuCheckboxItem({
  className,
  ...props
}: MenuPrimitive.CheckboxItem.Props): React.ReactElement {
  return (
    <MenuPrimitive.CheckboxItem
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      data-slot="menu-checkbox-item"
      {...props}
    />
  );
}

// RadioGroup
export const MenuRadioGroup: typeof MenuPrimitive.RadioGroup =
  MenuPrimitive.RadioGroup;

// RadioItem
export function MenuRadioItem({
  className,
  ...props
}: MenuPrimitive.RadioItem.Props): React.ReactElement {
  return (
    <MenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      data-slot="menu-radio-item"
      {...props}
    />
  );
}

// Composite MenuPopup: wraps Portal → Positioner → Popup for a convenient API.
// Accepts `anchor`, `align`, `side`, `sideOffset`, `finalFocus` and `className`.
export function MenuPopup({
  children,
  className,
  anchor,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  finalFocus,
  portalProps,
  ...props
}: MenuPrimitive.Popup.Props & {
  anchor?: MenuPrimitive.Positioner.Props["anchor"];
  align?: MenuPrimitive.Positioner.Props["align"];
  side?: MenuPrimitive.Positioner.Props["side"];
  sideOffset?: MenuPrimitive.Positioner.Props["sideOffset"];
  portalProps?: MenuPrimitive.Portal.Props;
}): React.ReactElement {
  return (
    <MenuPrimitive.Portal {...portalProps}>
      <MenuPrimitive.Positioner
        anchor={anchor}
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] data-instant:transition-none"
        data-slot="menu-positioner"
      >
        <MenuPrimitive.Popup
          finalFocus={finalFocus}
          className={cn(
            "relative min-w-[8rem] overflow-hidden rounded-md border bg-popover not-dark:bg-clip-padding p-1 text-popover-foreground shadow-md/5 outline-none transition-[scale,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
            className,
          )}
          data-slot="menu-popup"
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export { MenuPrimitive };
