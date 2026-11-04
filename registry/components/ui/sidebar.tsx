"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { SidebarSimpleIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Mireye's rail: 212px of white beside the canvas, a 1px Stone line at its edge. Rows are 32px and square, 12px in
// from the rail's sides: a 16px Phosphor glyph (regular weight) and a 13px Forest label 8px after it. A row under the
// pointer fills with Fog, the current row sits on Mist (150ms, color only; nothing moves). A labeled group starts with
// its label as a 1px-framed chip (12px, Forest at 80%). The foot is ruled off above in Mist. `secondary` is a second
// rail on the canvas with the current row in white. Collapsing to icons narrows the rail to its 32px glyph squares
// (each names itself in a tooltip 12px to the right); the keyboard shortcut toggles it instantly. A count at a row's
// right end is a small Forest number.
const SIDEBAR_WIDTH = "var(--ds-layout-rail)";
const SIDEBAR_WIDTH_ICON = "calc(var(--ds-space-8) + var(--ds-space-6) + 1px)";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MOBILE_QUERY = "(max-width: 767px)";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  instant: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isMobile;
}

/**
 * Holds whether the rail is open (expanded or collapsed on a desktop, shown in a sheet on a phone). Uncontrolled with
 * `defaultOpen`, or controlled with `open` and `onOpenChange`. Nothing is stored: keep the state yourself if it should
 * survive a reload. Cmd or Ctrl and B toggles it.
 */
function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }: React.ComponentProps<"div"> & { defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [instant, setInstant] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value;
      if (setOpenProp) setOpenProp(next);
      else setInternalOpen(next);
    },
    [setOpenProp, open],
  );
  const toggleSidebar = React.useCallback(() => {
    setInstant(false);
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    // A shortcut is pressed many times a day: it changes the rail at once, with no motion.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== SIDEBAR_KEYBOARD_SHORTCUT || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setInstant(true);
      if (isMobile) setOpenMobile((o) => !o);
      else setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, setOpen]);

  const state = open ? "expanded" : "collapsed";
  const value = React.useMemo<SidebarContextProps>(() => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, instant }), [state, open, setOpen, isMobile, openMobile, toggleSidebar, instant]);

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          data-instant={instant || undefined}
          style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-page", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

/**
 * The rail. `variant`: sidebar (the white rail with its Stone edge), secondary (a second rail on the canvas), floating
 * (a white panel in the 1px Stone line, 8px from the edges) or inset (the rail on the canvas with the page as a white
 * panel in the Stone line beside it).
 * `collapsible`: offcanvas (slides away), icon (narrows to its glyphs) or none.
 */
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { side?: "left" | "right"; variant?: "sidebar" | "secondary" | "floating" | "inset"; collapsible?: "offcanvas" | "icon" | "none" }) {
  const { isMobile, state, openMobile, setOpenMobile, instant } = useSidebar();
  const ground = variant === "sidebar" || variant === "floating" ? "bg-surface" : "bg-page";

  if (collapsible === "none") {
    return (
      <div data-slot="sidebar" data-variant={variant} className={cn("group/sidebar flex h-full w-(--sidebar-width) flex-col text-fg", ground, variant === "sidebar" && "border-r border-line", className)} {...props}>
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent instant={instant} data-slot="sidebar" data-sidebar="sidebar" data-mobile="true" data-variant={variant} side={side} showCloseButton={false} className={cn("group/sidebar w-(--ds-layout-rail) max-w-[calc(100vw-var(--ds-space-12))] p-0 text-fg sm:max-w-(--ds-layout-rail) [&>button]:hidden", ground)}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>The app's sections and settings.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      className="group/sidebar peer hidden shrink-0 text-fg md:block"
    >
      {/* Holds the rail's room in the row, so the page beside it moves as it opens and closes. */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative h-full w-(--sidebar-width) bg-transparent transition-[width] duration-base ease-out group-data-[collapsible=offcanvas]/sidebar:w-0 group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon) in-data-[instant=true]:transition-none motion-reduce:transition-none",
          (variant === "floating" || variant === "inset") && "group-data-[collapsible=icon]/sidebar:w-[calc(var(--sidebar-width-icon)+var(--ds-space-4))]",
        )}
      >
        <div
          data-slot="sidebar-container"
          className={cn(
            "sticky top-0 z-10 flex h-svh max-h-full w-(--sidebar-width) overflow-hidden transition-[translate,width] duration-base ease-out in-data-[instant=true]:transition-none motion-reduce:transition-none",
            side === "left" ? "left-0 group-data-[collapsible=offcanvas]/sidebar:-translate-x-full" : "ml-auto group-data-[collapsible=offcanvas]/sidebar:translate-x-full",
            variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]/sidebar:w-[calc(var(--sidebar-width-icon)+var(--ds-space-4))]" : "group-data-[collapsible=icon]/sidebar:w-(--sidebar-width-icon)",
            variant === "sidebar" && (side === "left" ? "border-r border-line" : "border-l border-line"),
            className,
          )}
          {...props}
        >
          <div data-sidebar="sidebar" data-slot="sidebar-inner" className={cn("flex h-full w-full flex-col", ground, variant === "floating" && "border border-line")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      aria-expanded={isMobile ? openMobile : open}
      className={cn("text-fg", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <SidebarSimpleIcon className="size-4.5" />
      <span className="sr-only">Toggle the rail</span>
    </Button>
  );
}

/** A thin strip along the rail's edge that toggles it; its line turns Forest under the pointer. */
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle the rail"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle the rail"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-transparent after:transition-colors after:duration-fast after:ease-out hover:after:bg-line-strong sm:flex",
        "in-data-[side=left]:-right-4 in-data-[side=left]:cursor-w-resize in-data-[side=right]:left-0 in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        className,
      )}
      {...props}
    />
  );
}

/** The page beside the rail. With the inset rail it becomes a white panel in the 1px Stone line, square. */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("relative flex w-full min-w-0 flex-1 flex-col bg-surface", "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:border-line", className)}
      {...props}
    />
  );
}

function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input data-slot="sidebar-input" data-sidebar="input" className={cn("h-9 bg-surface", className)} {...props} />;
}

/** The rail's head: the lockup, or a project switcher. */
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" data-sidebar="header" className={cn("flex min-h-14 shrink-0 flex-col justify-center gap-2 px-3 py-3", className)} {...props} />;
}

/** The rail's foot (Help, the account, Collapse), ruled off above in Mist. */
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" data-sidebar="footer" className={cn("flex shrink-0 flex-col gap-0.5 border-t border-line-subtle p-3", className)} {...props} />;
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="sidebar-separator" data-sidebar="separator" className={cn("mx-3 w-auto", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn("flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain [scrollbar-width:none] group-data-[collapsible=icon]/sidebar:overflow-hidden", className)}
      {...props}
    />
  );
}

/** A group of rows. A labeled group keeps 12px above and below it; an unlabeled one (the rows under the head) none. */
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group" data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col px-3 py-3 [&:not(:has(>[data-slot=sidebar-group-label]))]:py-0", className)} {...props} />;
}

/** A group's label as a 1px-framed chip, 12px in Forest at 80%; it folds away when the rail is narrowed to its glyphs. */
function SidebarGroupLabel({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.div : "div";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return (
    <Comp {...slotProps}
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "mb-2 flex h-5 w-fit shrink-0 items-center gap-1 border border-line px-1.5 font-sans text-caption leading-none font-normal whitespace-nowrap text-fg-secondary outline-none transition-[margin,opacity] duration-base ease-out group-data-[collapsible=icon]/sidebar:-mt-5 group-data-[collapsible=icon]/sidebar:opacity-0 motion-reduce:transition-none [&>svg]:size-3.5 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

/** A group's action beside its label (add a saved search): a 16px glyph, 12px from the edge. */
function SidebarGroupAction({ className, asChild = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.button : "button";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return (
    <Comp {...slotProps}
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "absolute top-2 right-3 flex size-6 cursor-pointer items-center justify-center text-fg-muted outline-none transition-colors duration-fast ease-out hover:bg-subtle hover:text-fg active:bg-subtle-hover focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong group-data-[collapsible=icon]/sidebar:hidden motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group-content" data-sidebar="group-content" className={cn("w-full", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />;
}

// A row: 32px, square, the 16px glyph 12px in and the 13px Forest label 8px after it. Hover fills it with Fog; the
// current row sits on Mist (white on the canvas rails). Narrowed to icons, the row is a 32px square around its glyph.
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden px-3 text-left font-sans font-normal text-fg outline-none transition-[background-color,color] duration-fast ease-out group-has-data-[sidebar=menu-action]/menu-item:pr-9 group-has-data-[sidebar=menu-badge]/menu-item:pr-10 group-data-[collapsible=icon]/sidebar:size-8! group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:p-0! group-data-[collapsible=icon]/sidebar:[&>span:not([data-slot=avatar])]:sr-only focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong disabled:pointer-events-none disabled:text-fg-subtle aria-disabled:pointer-events-none aria-disabled:text-fg-subtle data-[active=true]:bg-subtle-hover group-data-[variant=secondary]/sidebar:data-[active=true]:bg-surface group-data-[variant=inset]/sidebar:data-[active=true]:bg-surface data-[state=open]:bg-subtle-hover motion-reduce:transition-none [&>span:last-child]:truncate [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "hover:bg-subtle data-[active=true]:hover:bg-subtle-hover group-data-[variant=secondary]/sidebar:data-[active=true]:hover:bg-surface group-data-[variant=inset]/sidebar:data-[active=true]:hover:bg-surface",
        outline: "border border-line bg-surface hover:bg-subtle",
      },
      size: {
        default: "h-8 text-body leading-snug",
        sm: "h-7 text-caption leading-snug [&>svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 text-body leading-snug group-data-[collapsible=icon]/sidebar:p-0!",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; isActive?: boolean; tooltip?: string | React.ComponentProps<typeof TooltipContent> } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? chakra.button : "button";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  const { isMobile, state } = useSidebar();
  // The tooltip names a row only while the rail shows glyphs alone; otherwise it stays shut, so it never catches Escape.
  const [tipOpen, setTipOpen] = React.useState(false);
  const showTip = state === "collapsed" && !isMobile;
  const button = (
    <Comp {...slotProps}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
  if (!tooltip) return button;
  const content = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  return (
    <Tooltip open={showTip && tipOpen} onOpenChange={setTipOpen}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" sideOffset={12} {...content} />
    </Tooltip>
  );
}

/** An action at a row's right end (a row's more glyph). `showOnHover` keeps it hidden until the row is hovered or open. */
function SidebarMenuAction({ className, asChild = false, showOnHover = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean; showOnHover?: boolean }) {
  const Comp = asChild ? chakra.button : "button";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return (
    <Comp {...slotProps}
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center text-fg-muted outline-none transition-[color,opacity] duration-fast ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong group-data-[collapsible=icon]/sidebar:hidden motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-0.5 peer-data-[size=lg]/menu-button:top-3",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-fg md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A mark at a row's right end, 8px in: `mark` is a white chip in the 1px Stone line with 12px Forest text (New, Beta);
 * `count` is the small Forest number (12 saved sites). For a mark right after the label, put a Badge inside the row.
 */
function SidebarMenuBadge({ className, variant = "mark", ...props }: React.ComponentProps<"div"> & { variant?: "mark" | "count" }) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      data-variant={variant}
      className={cn(
        "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center font-sans font-medium whitespace-nowrap select-none group-data-[collapsible=icon]/sidebar:hidden",
        variant === "mark" ? "right-2 h-5 border border-line bg-surface px-1.5 text-caption leading-none font-normal text-fg" : "right-2 h-4 min-w-4 bg-inverse px-1 text-micro leading-none font-normal text-fg-inverse tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** A row's placeholder while the rail loads: a glyph square and a label of varying width. */
function SidebarMenuSkeleton({ className, showIcon = false, ...props }: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  // A width between 50 and 90 percent that differs from row to row but is the same on the server and in the browser.
  const id = React.useId();
  const width = `${50 + (([...id].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) % 997, 7) % 41))}%`;
  return (
    <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" className={cn("flex h-8 items-center gap-2 px-3", className)} {...props}>
      {showIcon && <Skeleton className="size-4" data-sidebar="menu-skeleton-icon" />}
      <Skeleton className="h-3 max-w-(--skeleton-width) flex-1" data-sidebar="menu-skeleton-text" style={{ "--skeleton-width": width } as React.CSSProperties} />
    </div>
  );
}

/** Rows nested under a row, hung from a 1px Mist rule under the parent's glyph. */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn("mt-0.5 mr-0 ml-5 flex min-w-0 flex-col gap-0.5 border-l border-line-subtle py-0.5 pl-2 group-data-[collapsible=icon]/sidebar:hidden", className)}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} />;
}

function SidebarMenuSubButton({ asChild = false, size = "md", isActive = false, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean; size?: "sm" | "md"; isActive?: boolean }) {
  const Comp = asChild ? chakra.a : "a";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return (
    <Comp {...slotProps}
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-7 min-w-0 cursor-pointer items-center gap-2 overflow-hidden px-2.5 font-sans font-normal text-fg-secondary outline-none transition-[background-color,color] duration-fast ease-out hover:bg-subtle hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong aria-disabled:pointer-events-none aria-disabled:text-fg-subtle data-[active=true]:bg-subtle-hover data-[active=true]:text-fg group-data-[variant=secondary]/sidebar:data-[active=true]:bg-surface motion-reduce:transition-none [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        size === "sm" ? "text-caption" : "text-body",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
