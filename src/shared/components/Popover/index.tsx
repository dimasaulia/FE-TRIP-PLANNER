"use client";

import { Popover as RadixPopover } from "radix-ui";

type PopoverProps = {
  trigger?: React.ReactNode;
  anchor?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  width?: number;
};

export function Popover({ trigger, anchor, children, open, onOpenChange, side = "bottom", align = "start", width = 300 }: PopoverProps) {
  return (
    <RadixPopover.Root onOpenChange={onOpenChange} open={open}>
      {trigger ? <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger> : null}
      {anchor ? <RadixPopover.Anchor asChild>{anchor}</RadixPopover.Anchor> : null}
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          className="z-50 rounded-card border border-line bg-surface p-4 shadow-xl"
          collisionPadding={16}
          side={side}
          sideOffset={8}
          style={{ width }}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

export const PopoverClose = RadixPopover.Close;
