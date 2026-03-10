"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type SheetContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  side?: "left" | "right";
  overlayClassName?: string;
  closeClassName?: string;
};

function Sheet({
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Root>) {
  return <Dialog.Root data-slot="sheet" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Portal>) {
  return <Dialog.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Overlay>) {
  return (
    <Dialog.Overlay
      data-slot="sheet-overlay"
      className={`fixed inset-0 z-50 bg-black/35 lg:bg-transparent ${className}`}
      {...props}
    />
  );
}

function SheetClose({
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Close>) {
  return <Dialog.Close data-slot="sheet-close" {...props} />;
}

function SheetContent({
  side = "right",
  overlayClassName = "",
  closeClassName = "",
  className = "",
  children,
  ...props
}: SheetContentProps) {
  const sideClassName =
    side === "left"
      ? "inset-y-0 left-0 border-r"
      : "inset-y-0 right-0 border-l";

  return (
    <SheetPortal>
      <SheetOverlay className={overlayClassName} />
      <Dialog.Content
        data-slot="sheet-content"
        className={`fixed z-50 bg-background shadow-soft ${sideClassName} ${className}`}
        {...props}
      >
        <Dialog.Title className="sr-only">Sidebar sheet</Dialog.Title>
        {children}
        <SheetClose
          className={`absolute right-3 top-3 rounded-md p-1 text-foreground-muted transition hover:bg-surface-hover hover:text-foreground ${closeClassName}`}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </Dialog.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sheet-header" className={className} {...props} />;
}

function SheetTitle({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      data-slot="sheet-title"
      className={`text-base font-semibold text-foreground ${className}`}
      {...props}
    />
  );
}

function SheetDescription({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      data-slot="sheet-description"
      className={`text-sm text-foreground-muted ${className}`}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
};
