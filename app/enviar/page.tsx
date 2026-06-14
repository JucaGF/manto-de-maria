import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarianHeader } from "@/components/MarianHeader";
import { SendMessageForm } from "@/components/SendMessageForm";

export default function SendPage() {
  return (
    <main className="sky-page inner-page">
      <div className="star-field" aria-hidden="true" />
      <div className="page-shell">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar
        </Link>
        <MarianHeader
          compact
          subtitle="Uma palavra de carinho pode iluminar o dia de alguém."
        />
        <SendMessageForm />
      </div>
      <div className="cloud-layer" aria-hidden="true" />
    </main>
  );
}
