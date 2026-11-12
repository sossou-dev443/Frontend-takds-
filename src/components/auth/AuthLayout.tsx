import Image from "next/image";
import type { ReactNode } from "react";
import BackLink from "./BackLink";

type AuthLayoutProps = {
  title: string;
  subtitle: ReactNode;
  illustrationSrc: string;
  illustrationAlt: string;
  backHref: string;
  backUseHistory?: boolean;
  formLabel: string;
  children: ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  illustrationSrc,
  illustrationAlt,
  backHref,
  backUseHistory = false,
  formLabel,
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <section className="visual-panel">
        <BackLink href={backHref} useHistory={backUseHistory} />
        <div className="intro">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="illustration-frame">
          <Image
            className="illustration"
            src={illustrationSrc}
            alt={illustrationAlt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 610px"
          />
        </div>
      </section>

      <section className="form-panel" aria-label={formLabel}>
        {children}
      </section>
    </main>
  );
}
