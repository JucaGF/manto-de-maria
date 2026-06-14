import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarianHeader } from "@/components/MarianHeader";
import { ReadMessagesForm } from "@/components/ReadMessagesForm";

export default function MessagesPage() {
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
          subtitle="Este é o seu cantinho particular sob o Manto de Maria."
        />
        <ReadMessagesForm />
      </div>
      <div className="cloud-layer" aria-hidden="true" />
    </main>
  );
}
