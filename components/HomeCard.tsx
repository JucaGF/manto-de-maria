import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type HomeCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
};

export function HomeCard({
  href,
  icon,
  title,
  description,
}: HomeCardProps) {
  return (
    <Link href={href} className="home-card">
      <span className="home-card-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="home-card-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ChevronRight className="home-card-arrow" aria-hidden="true" size={21} />
    </Link>
  );
}
