import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, LogOut, Salad, Sprout, UserRound } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppShell, ShellLoading, type ShellNavProps } from "@/components/peakcycle/AppShell";
import { NavButton, navLinkActiveClass, navLinkClass } from "@/components/peakcycle/NavLink";
import { usePeakCycle } from "@/lib/peakcycle/store";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Explorar alimentos — PeakCycle" },
      {
        name: "description",
        content: "Encontre alimentos doados ou a preço simbólico perto de você e faça seu resgate.",
      },
      { property: "og:title", content: "Explorar alimentos — PeakCycle" },
      {
        property: "og:description",
        content: "Resgate alimentos próximos da validade e reduza o desperdício.",
      },
    ],
  }),
  component: ClientLayout,
});

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/app": { title: "Explorar Alimentos", subtitle: "Boas escolhas alimentam pessoas e preservam o planeta." },
  "/app/resgates": { title: "Meus Resgates", subtitle: "Acompanhe suas reservas e retiradas." },
  "/app/impacto": { title: "Meu Impacto", subtitle: "Veja quanto alimento você já ajudou a salvar." },
  "/app/perfil": { title: "Meu Perfil", subtitle: "Seus dados na plataforma." },
};

function ClientLayout() {
  const { session, hydrated, logout } = usePeakCycle();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      navigate({ to: "/" });
    } else if (session.role !== "client") {
      toast.error("Esta área é exclusiva de clientes e ONGs.");
      navigate({ to: "/admin" });
    }
  }, [hydrated, session, navigate]);

  if (!hydrated || !session || session.role !== "client") return <ShellLoading />;

  const page = TITLES[pathname.replace(/\/$/, "")] ?? TITLES["/app"]!;

  const renderNav = ({ onNavigate }: ShellNavProps) => (
    <>
      <Link
        to="/app"
        activeOptions={{ exact: true }}
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <Salad className="size-4" /> Explorar Alimentos
      </Link>
      <Link
        to="/app/resgates"
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <Heart className="size-4" /> Meus Resgates
      </Link>
      <Link
        to="/app/impacto"
        activeProps={{ className: `${navLinkClass} ${navLinkActiveClass}` }}
        inactiveProps={{ className: navLinkClass }}
        onClick={onNavigate}
      >
        <Sprout className="size-4" /> Meu Impacto
      </Link>
      <Link
        to="/app/perfil"
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
          <p className="font-semibold text-foreground">{session.name}</p>
          <p className="text-muted-foreground">Comunidade PeakCycle</p>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
