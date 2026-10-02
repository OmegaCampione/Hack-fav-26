import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";

export interface ShellNavProps {
  onNavigate: () => void;
}

export function AppShell({
  renderNav,
  title,
  subtitle,
  children,
  footer,
}: {
  renderNav: (props: ShellNavProps) => ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
        <Logo className="px-2" />
        <nav className="mt-8 flex flex-1 flex-col gap-1">{renderNav({ onNavigate: () => {} })}</nav>
        {footer}
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 px-4 py-6">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <Logo className="px-2" />
            <nav className="mt-8 flex flex-col gap-1">
              {renderNav({ onNavigate: () => setOpen(false) })}
            </nav>
            <div className="mt-6">{footer}</div>
          </SheetContent>
        </Sheet>
        <Logo compact />
        <span className="font-display text-base font-semibold">{title}</span>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="mb-5 lg:hidden">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function ShellLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Logo />
        <p className="text-sm text-muted-foreground">Carregando seus dados...</p>
      </div>
    </div>
  );
}
