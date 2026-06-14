import Image from "next/image";

type MarianHeaderProps = {
  compact?: boolean;
  subtitle?: string;
};

export function MarianHeader({
  compact = false,
  subtitle = "Um espaço de carinho, oração e mensagens anônimas para o nosso círculo.",
}: MarianHeaderProps) {
  return (
    <header className={compact ? "marian-header compact" : "marian-header"}>
      <div className="marian-stars" aria-hidden="true">
        <span>✦</span>
        <span>★</span>
        <span>✧</span>
      </div>
      <div className="marian-image-wrap">
        <div className="marian-halo" aria-hidden="true" />
        <Image
          className="marian-image"
          src="/maria.png"
          alt="Nossa Senhora em oração"
          width={1536}
          height={1024}
          priority={!compact}
          sizes={compact ? "180px" : "(max-width: 480px) 94vw, 430px"}
        />
      </div>
      {!compact && <p className="eyebrow">Nosso círculo</p>}
      <h1>Manto de Maria</h1>
      <p className="marian-subtitle">{subtitle}</p>
    </header>
  );
}
