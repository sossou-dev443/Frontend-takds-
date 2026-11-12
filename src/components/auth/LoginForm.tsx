"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import FormError from "./FormError";
import FormField from "./FormField";
import PasswordInput from "./PasswordInput";
import { getFieldErrors, getGeneralErrorMessage } from "@/lib/api";
import { getPostAuthDestination, login } from "@/lib/auth";
import { normalizeEmail, validateLogin } from "@/lib/validation";
import type { FieldErrors, LoginField } from "@/lib/validation";
import type { LoginFormValues } from "@/types/auth";

const INITIAL_VALUES: LoginFormValues = {
  identifier: "",
  password: "",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const canSubmit =
    values.identifier.trim().length > 0 &&
    values.password.length > 0 &&
    !submitting;

  function updateField(field: LoginField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const validationErrors = validateLogin(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError("Veuillez corriger les champs indiqués.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    setSuccess(null);

    try {
      const user = await login({
        identifier: normalizeEmail(values.identifier),
        password: values.password,
      });

      // Le mot de passe ne reste pas en mémoire après une connexion réussie.
      setValues((previous) => ({ ...previous, password: "" }));
      setSuccess("Connexion réussie. Redirection…");
      await wait(400);
      router.replace(getPostAuthDestination(user, next));
    } catch (error) {
      const apiFieldErrors = getFieldErrors(error);
      const mappedErrors: FieldErrors<LoginField> = {};

      if (apiFieldErrors.identifier) mappedErrors.identifier = apiFieldErrors.identifier;
      if (apiFieldErrors.email) mappedErrors.identifier = apiFieldErrors.email;
      if (apiFieldErrors.password) mappedErrors.password = apiFieldErrors.password;

      setFieldErrors(mappedErrors);
      setFormError(getGeneralErrorMessage(error));
      // 401 invalid-credentials : le mot de passe reste saisissable pour réessayer,
      // les autres champs ne sont jamais effacés.
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form
      className="auth-card"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulaire de connexion"
    >
      <FormField
        id="identifier"
        label="Nom d’utilisateur ou email"
        error={fieldErrors.identifier}
      >
        <input
          id="identifier"
          name="identifier"
          type="text"
          placeholder="Conception de site web"
          autoComplete="username"
          value={values.identifier}
          onChange={(event) => updateField("identifier", event.target.value)}
          aria-invalid={fieldErrors.identifier ? true : undefined}
          aria-describedby={
            fieldErrors.identifier ? "identifier-error" : undefined
          }
          required
        />
      </FormField>

      <FormField
        id="password"
        label="Mot de passe"
        error={fieldErrors.password}
      >
        <PasswordInput
          id="password"
          name="password"
          placeholder="Conception de site web"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
          invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          required
        />
      </FormField>

      <button type="submit" className="submit-button" disabled={!canSubmit}>
        {submitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Connexion…
          </>
        ) : (
          "Se connecter"
        )}
      </button>

      <FormError message={formError} />
      <FormError message={success} tone="success" />

      <p className="switch-copy">
        Pas encore inscrit? <Link href="/register">Inscrivez-vous ici</Link>
      </p>
    </form>
  );
}
