import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte TaskD.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Inscrivez-vous ici"
      subtitle={
        <>
          Devenez l’un des incontournables dans
          <br className="desktop-break" /> votre domaine
        </>
      }
      illustrationSrc="/images/register-illustration.jpg"
      illustrationAlt="Illustration 3D d'un personnage assis sur une fusée"
      backHref="/login"
      formLabel="Formulaire d’inscription"
    >
      <Suspense
        fallback={
          <form className="auth-card" aria-busy="true">
            <p className="switch-copy">Chargement du formulaire…</p>
          </form>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
