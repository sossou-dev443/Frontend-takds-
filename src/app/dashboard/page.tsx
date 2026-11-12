"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, getGeneralErrorMessage } from "@/lib/api";
import { getMe, logout } from "@/lib/auth";
import type { AuthUser, UserRole } from "@/types/auth";

function roleLabel(role: UserRole): string {
  if (role === "delegator") return "Délégué";
  if (role === "collaborator") return "Collaborateur";
  return "Administrateur";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    getMe()
      .then((data) => {
        if (!active) return;
        setUser(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.slug === "unauthenticated")
        ) {
          router.replace("/login?next=/dashboard");
          return;
        }
        setError(getGeneralErrorMessage(err));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError(null);

    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.slug === "unauthenticated")
      ) {
        router.replace("/login");
        return;
      }
      setError(getGeneralErrorMessage(err));
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="app-page">
        <p className="app-status">Vérification de votre session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-page">
        <section className="app-card">
          <p className="app-eyebrow">TaskD</p>
          <h1>Connexion requise</h1>
          <p className="app-subtitle">
            {error ?? "Redirection vers la page de connexion…"}
          </p>
          <div className="app-actions">
            <Link
              className="submit-button app-link-button"
              href="/login?next=/dashboard"
            >
              Se connecter
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-page">
      <section className="app-card">
        <p className="app-eyebrow">TaskD</p>
        <h1>Bonjour {user.firstNames}</h1>
        <p className="app-subtitle">
          Vous êtes connecté en tant que {roleLabel(user.role).toLowerCase()}.
        </p>

        {error ? (
          <p className="form-message" role="alert">
            {error}
          </p>
        ) : null}

        <dl className="app-details">
          <div>
            <dt>Nom</dt>
            <dd>{user.lastName}</dd>
          </div>
          <div>
            <dt>Prénoms</dt>
            <dd>{user.firstNames}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Téléphone</dt>
            <dd>{user.phone}</dd>
          </div>
          <div>
            <dt>Profession</dt>
            <dd>{user.profession}</dd>
          </div>
          <div>
            <dt>Rôle</dt>
            <dd>{roleLabel(user.role)}</dd>
          </div>
          <div>
            <dt>Compte créé le</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt>Profil complété</dt>
            <dd>{user.profileCompleted ? "Oui" : "Non"}</dd>
          </div>
        </dl>

        {user.role === "collaborator" && !user.profileCompleted ? (
          <p className="app-note">
            Votre profil n’est pas encore complet.{" "}
            <Link href="/dashboard/profile">Compléter mon profil</Link>
          </p>
        ) : null}

        <p className="app-note">
          Les fonctionnalités métier (offres et missions) seront ajoutées dans une
          prochaine version.
        </p>

        <div className="app-actions">
          <Link className="submit-button app-link-button" href="/dashboard/profile">
            Mon profil
          </Link>
          <Link
            className="submit-button app-link-button app-link-button--secondary"
            href="/offers"
          >
            Mes offres
          </Link>
          <button
            type="button"
            className="submit-button app-link-button app-link-button--secondary"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </section>
    </main>
  );
}
