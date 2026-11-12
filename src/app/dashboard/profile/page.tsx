import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Complétion du profil",
  description: "Complétez votre profil TaskD.",
};

export default function ProfileCompletionPage() {
  return (
    <main className="app-page">
      <section className="app-card">
        <p className="app-eyebrow">TaskD</p>
        <h1>Complétion du profil</h1>
        <p className="app-subtitle">
          Cette étape est préparée pour les collaborateurs. Votre compte a bien été
          créé, mais le formulaire de complétion n’est pas encore développé.
        </p>
        <p className="app-note">
          Les fonctionnalités de ce parcours seront ajoutées dans une prochaine
          version.
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
