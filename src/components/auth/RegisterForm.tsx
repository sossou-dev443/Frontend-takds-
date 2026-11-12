"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import FormError from "./FormError";
import FormField from "./FormField";
import PasswordInput from "./PasswordInput";
import { getFieldErrors, getGeneralErrorMessage } from "@/lib/api";
import { getPostRegisterDestination, register } from "@/lib/auth";
import {
  normalizeEmail,
  normalizePhone,
  validateRegister,
} from "@/lib/validation";
import type { FieldErrors, RegisterField } from "@/lib/validation";
import type {
  RegisterFormValues,
  RegisterPayload,
  RegisterRole,
} from "@/types/auth";

const ROLE_LABELS: Record<RegisterRole, string> = {
  delegator: "Déléguer une tâche",
  collaborator: "Trouver une tâche",
};

const API_FIELD_MAP: Record<string, RegisterField> = {
  lastName: "lastName",
  firstNames: "firstNames",
  firstName: "firstNames",
  phone: "phone",
  email: "email",
  profession: "profession",
  password: "password",
  role: "role",
  acceptTerms: "acceptTerms",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const presetRole: RegisterRole | null =
    roleParam === "delegator" || roleParam === "collaborator" ? roleParam : null;

  const [values, setValues] = useState<RegisterFormValues>(() => ({
    lastName: "",
    firstNames: "",
    phone: "",
    email: "",
    profession: "",
    password: "",
    role: presetRole ?? "",
    acceptTerms: false,
  }));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  function updateField<K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const validationErrors = validateRegister(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError("Veuillez corriger les champs indiqués.");
      return;
    }

    const role = values.role as RegisterRole;
    const payload: RegisterPayload = {
      lastName: values.lastName.trim(),
      firstNames: values.firstNames.trim(),
      phone: normalizePhone(values.phone),
      email: normalizeEmail(values.email),
      profession: values.profession.trim(),
      password: values.password,
      role,
      acceptTerms: true,
    };

    setSubmitting(true);
    submittingRef.current = true;
    setFieldErrors({});
    setFormError(null);
    setSuccess(null);

    try {
      const user = await register(payload);

      // Le mot de passe ne reste pas en mémoire après une inscription réussie.
      setValues((previous) => ({ ...previous, password: "" }));
      setSuccess("Inscription réussie. Redirection…");
      await wait(400);
      router.replace(getPostRegisterDestination(user));
    } catch (error) {
      const apiFieldErrors = getFieldErrors(error);
      const mappedErrors: FieldErrors<RegisterField> = {};

      for (const [apiField, message] of Object.entries(apiFieldErrors)) {
        const field = API_FIELD_MAP[apiField];
        if (field) mappedErrors[field] = message;
      }

      setFieldErrors(mappedErrors);
      setFormError(getGeneralErrorMessage(error));
      // Les valeurs non sensibles restent saisies pour permettre la correction.
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
      aria-label="Formulaire d’inscription"
    >
      <div className="register-fields">
        <div className="name-row">
          <FormField id="lastName" label="Nom" error={fieldErrors.lastName}>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Conception de site web"
              autoComplete="family-name"
              value={values.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              aria-invalid={fieldErrors.lastName ? true : undefined}
              aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
              required
            />
          </FormField>

          <FormField
            id="firstNames"
            label="Prénoms"
            error={fieldErrors.firstNames}
          >
            <input
              id="firstNames"
              name="firstNames"
              type="text"
              placeholder="Mettez votre question"
              autoComplete="given-name"
              value={values.firstNames}
              onChange={(event) => updateField("firstNames", event.target.value)}
              aria-invalid={fieldErrors.firstNames ? true : undefined}
              aria-describedby={
                fieldErrors.firstNames ? "firstNames-error" : undefined
              }
              required
            />
          </FormField>
        </div>

        <FormField id="phone" label="Téléphone" error={fieldErrors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="Conception de site web"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            aria-invalid={fieldErrors.phone ? true : undefined}
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            required
          />
        </FormField>

        <FormField id="email" label="Email" error={fieldErrors.email}>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Conception de site web"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            required
          />
        </FormField>

        <FormField
          id="profession"
          label="Profession"
          error={fieldErrors.profession}
        >
          <input
            id="profession"
            name="profession"
            type="text"
            placeholder="Conception de site web"
            autoComplete="organization-title"
            value={values.profession}
            onChange={(event) => updateField("profession", event.target.value)}
            aria-invalid={fieldErrors.profession ? true : undefined}
            aria-describedby={
              fieldErrors.profession ? "profession-error" : undefined
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
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            required
          />
        </FormField>
      </div>

      <div className={`checkbox-field${fieldErrors.acceptTerms ? " has-error" : ""}`}>
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          checked={values.acceptTerms}
          onChange={(event) => updateField("acceptTerms", event.target.checked)}
          aria-invalid={fieldErrors.acceptTerms ? true : undefined}
          aria-describedby={
            fieldErrors.acceptTerms ? "acceptTerms-error" : undefined
          }
          required
        />
        <label htmlFor="acceptTerms">
          J’accepte les conditions générales d’utilisation.
        </label>
      </div>

      {fieldErrors.acceptTerms ? (
        <p className="field-error checkbox-error" id="acceptTerms-error" role="alert">
          {fieldErrors.acceptTerms}
        </p>
      ) : null}

      {presetRole ? (
        <p className="role-note">
          Rôle sélectionné : <strong>{ROLE_LABELS[presetRole]}</strong>
        </p>
      ) : (
        <FormField id="role" label="Je souhaite" error={fieldErrors.role}>
          <select
            id="role"
            name="role"
            value={values.role}
            onChange={(event) =>
              updateField("role", event.target.value as RegisterRole | "")
            }
            aria-invalid={fieldErrors.role ? true : undefined}
            aria-describedby={fieldErrors.role ? "role-error" : undefined}
            required
          >
            <option value="" disabled>
              Sélectionnez un rôle
            </option>
            <option value="delegator">Déléguer une tâche</option>
            <option value="collaborator">Trouver une tâche</option>
          </select>
        </FormField>
      )}

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Inscription…
          </>
        ) : (
          "Continuer"
        )}
      </button>

      <FormError message={formError} />
      <FormError message={success} tone="success" />

      <p className="switch-copy">
        Déjà inscrit? <Link href="/login">Connectez-vous ici</Link>
      </p>
    </form>
  );
}
