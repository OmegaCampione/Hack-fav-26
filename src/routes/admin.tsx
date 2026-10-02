import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, LayoutDashboard, LogOut, Package, PlusCircle, UserRound } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppShell, ShellLoading, type ShellNavProps } from "@/components/peakcycle/AppShell";
import { NavButton, navLinkActiveClass, navLinkClass } from "@/components/peakcycle/NavLink";
import { usePeakCycle } from "@/lib/peakcycle/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel da Loja — PeakCycle" },
      { name: "description", content: "Gerencie estoque, cadastros e reservas da sua loja." },
      { property: "og:title", content: "Painel da Loja — PeakCycle" },
      { property: "og:description", content: "Gerencie estoque, cadastros e reservas." },
    ],
  }),
  component: AdminLayout,
});

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Acompanhe o impacto da sua loja em tempo real." },
  "/admin/produtos": { title: "Meus Produtos", subtitle: "Gerencie o estoque disponível." },
  "/admin/cadastrar": { title: "Cadastrar Alimento", subtitle: "Publique um novo item na vitrine." },
  "/admin/reservas": { title: "Reservas", subtitle: "Confirme, finalize ou cancele pedidos." },
  "/admin/perfil": { title: "Meu Perfil", subtitle: "Dados do estabelecimento." },
};

function AdminLayout() {
  const { session, hydrated, logout } = usePeakCycle();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      navigate({ to: "/" });
    } else if (session.role !== "admin") {
      toast.error("Esta área é exclusiva das lojas parceiras.");
      navigate({ to: "/app" });
    }
  }, [hydrated, session, navigate]);

  if (!hydrated || !session || session.role !== "admin") return <ShellLoading />;

  const page = TITLES[pathname.replace(/\/$/, "")] ?? TITLES["/admin"]!;

  const renderNav = ({ onNavigate }: ShellNavProps) => (
    <>
      <Link
        to="/admin"
        activeOptions={{ exact: true }}
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <LayoutDashboard className="size-4" /> Dashboard
      </Link>
      <Link
        to="/admin/produtos"
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <Package className="size-4" /> Meus Produtos
      </Link>
      <Link
        to="/admin/cadastrar"
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <PlusCircle className="size-4" /> Cadastrar Alimento
      </Link>
      <Link
        to="/admin/reservas"
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <CalendarCheck className="size-4" /> Reservas
      </Link>
      <Link
        to="/admin/perfil"
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <UserRound className="size-4" /> Meu Perfil
      </Link>
      <NavButton
        className="mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          onNavigate();
          logout();
          navigate({ to: "/" });
          toast.success("Sessão encerrada.");
        }}
      >
        <LogOut className="size-4" /> Sair
      </NavButton>
    </>
  );

  return (
    <AppShell
      renderNav={renderNav}
      title={page.title}
      subtitle={page.subtitle}
      footer={
        <div className="card-soft p-3 text-xs">
          <p className="font-semibold text-foreground">{session.storeName ?? session.name}</p>
          <p className="text-muted-foreground">Loja parceira PeakCycle</p>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
