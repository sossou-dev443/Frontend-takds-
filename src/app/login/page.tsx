import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte TaskD.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Connectez vous"
      subtitle={
        <>
          Bienvenue à vous. Accédez maintenant à<br className="desktop-break" />{" "}
          votre univers
        </>
      }
      illustrationSrc="/images/login-illustration.jpg"
      illustrationAlt="Illustration 3D d'un personnage utilisant un ordinateur"
      backHref="/login"
      backUseHistory
      formLabel="Formulaire de connexion"
    >
      <Suspense
        fallback={
          <form className="auth-card" aria-busy="true">
            <p className="switch-copy">Chargement du formulaire…</p>
          </form>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
