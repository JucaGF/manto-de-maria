import { Heart, Mail } from "lucide-react";
import { HomeCard } from "@/components/HomeCard";
import { MarianHeader } from "@/components/MarianHeader";

export default function HomePage() {
  return (
    <main className="sky-page home-page">
      <div className="star-field" aria-hidden="true" />
      <div className="page-shell">
        <MarianHeader />
        <nav className="home-actions" aria-label="Ações principais">
          <HomeCard
            href="/enviar"
            icon={<Heart size={22} />}
            title="Enviar mensagem"
            description="Compartilhe uma palavra especial"
          />
          <HomeCard
            href="/mensagens"
            icon={<Mail size={22} />}
            title="Ler minhas mensagens"
            description="Entre no seu espaço particular"
          />
        </nav>
        <p className="privacy-note">As mensagens são sempre anônimas.</p>
      </div>
      <div className="cloud-layer" aria-hidden="true" />
    </main>
  );
}
