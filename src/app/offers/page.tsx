import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mes offres",
  description: "Vos offres TaskD.",
};

export default function OffersPage() {
  return (
    <main className="app-page">
      <section className="app-card">
        <p className="app-eyebrow">TaskD</p>
        <h1>Mes offres</h1>
        <p className="app-subtitle">
          Cette page est la destination prévue pour les délégués après inscription
          ou connexion. La gestion des offres n’est pas encore développée.
        </p>
        <p className="app-note">
          Les fonctionnalités métier seront ajoutées dans une prochaine version.
        </p>
        <div className="app-actions">
          <Link className="submit-button app-link-button" href="/dashboard">
            Retour au tableau de bord
          </Link>
        </div>
      </section>
    </main>
  );
}
