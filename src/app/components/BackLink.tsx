import Link from "next/link";

export default function BackLink({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 12H4m0 0 7-7m-7 7 7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Retour</span>
    </Link>
  );
}