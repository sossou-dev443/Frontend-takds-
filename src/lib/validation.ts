import type { LoginFormValues, RegisterFormValues } from "@/types/auth";

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type LoginField = "identifier" | "password";
export type RegisterField = keyof RegisterFormValues;

export const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const NAME_MAX = 100;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const EMAIL_MAX = 254;

export function normalizePhone(value: string): string {
  return value.replace(/\s+/g, "");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validateName(
  value: string,
  label: string,
  plural = false,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return plural ? `${label} sont obligatoires.` : `${label} est obligatoire.`;
  }
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
    return plural
      ? `${label} doivent contenir entre ${NAME_MIN} et ${NAME_MAX} caractères.`
      : `${label} doit contenir entre ${NAME_MIN} et ${NAME_MAX} caractères.`;
  }
  return undefined;
}

export function validateLogin(values: LoginFormValues): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  const identifier = values.identifier.trim();

  if (!identifier) {
    errors.identifier = "L’adresse email est obligatoire.";
  } else if (!identifier.includes("@")) {
    errors.identifier =
      "La connexion par nom d’utilisateur n’est pas encore disponible. Saisissez votre adresse email.";
  } else if (identifier.length > EMAIL_MAX || !EMAIL_PATTERN.test(identifier)) {
    errors.identifier = "Veuillez saisir une adresse email valide.";
  }

  if (!values.password) {
    errors.password = "Le mot de passe est obligatoire.";
  }

  return errors;
}

export function validateRegister(
  values: RegisterFormValues,
): FieldErrors<RegisterField> {
  const errors: FieldErrors<RegisterField> = {};

  const lastNameError = validateName(values.lastName, "Le nom");
  if (lastNameError) errors.lastName = lastNameError;

  const firstNamesError = validateName(values.firstNames, "Les prénoms", true);
  if (firstNamesError) errors.firstNames = firstNamesError;

  const phone = normalizePhone(values.phone);
  if (!phone) {
    errors.phone = "Le numéro de téléphone est obligatoire.";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone =
      "Le numéro doit être au format international (ex. +2290197123456).";
  }

  const email = normalizeEmail(values.email);
  if (!email) {
    errors.email = "L’adresse email est obligatoire.";
  } else if (email.length > EMAIL_MAX) {
    errors.email = `L’adresse email ne doit pas dépasser ${EMAIL_MAX} caractères.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Veuillez saisir une adresse email valide.";
  }

  const professionError = validateName(values.profession, "La profession");
  if (professionError) errors.profession = professionError;

  if (!values.password) {
    errors.password = "Le mot de passe est obligatoire.";
  } else if (
    values.password.length < PASSWORD_MIN ||
    values.password.length > PASSWORD_MAX
  ) {
    errors.password = `Le mot de passe doit contenir entre ${PASSWORD_MIN} et ${PASSWORD_MAX} caractères.`;
  } else if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(values.password)) {
    errors.password = "Le mot de passe doit contenir au moins une lettre.";
  } else if (!/\d/.test(values.password)) {
    errors.password = "Le mot de passe doit contenir au moins un chiffre.";
  }

  if (values.role !== "delegator" && values.role !== "collaborator") {
    errors.role = "Choisissez un rôle.";
  }

  if (!values.acceptTerms) {
    errors.acceptTerms =
      "Vous devez accepter les conditions générales d’utilisation.";
  }

  return errors;
}
