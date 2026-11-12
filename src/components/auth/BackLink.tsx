"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

type BackLinkProps = {
  href: string;
  useHistory?: boolean;
};

export default function BackLink({ href, useHistory = false }: BackLinkProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!useHistory) return;
    event.preventDefault();

    if (typeof window === "undefined") return;

    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  }

  return (
    <Link href={href} className="back-link" onClick={handleClick}>
      <span aria-hidden="true">←</span> Retour
    </Link>
  );
}
