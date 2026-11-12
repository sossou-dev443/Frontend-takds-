export type RegisterRole = "delegator" | "collaborator";

/** Rôle retourné par le backend. `admin` n'est jamais envoyé à l'inscription. */
export type UserRole = RegisterRole | "admin";

export type AuthUser = {
  id: string;
  lastName: string;
  firstNames: string;
  email: string;
  phone: string;
  profession: string;
  role: UserRole;
  profileCompleted: boolean;
  createdAt: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  lastName: string;
  firstNames: string;
  phone: string;
  email: string;
  profession: string;
  password: string;
  role: RegisterRole;
  acceptTerms: true;
};

export type LoginFormValues = {
  identifier: string;
  password: string;
};

export type RegisterFormValues = {
  lastName: string;
  firstNames: string;
  phone: string;
  email: string;
  profession: string;
  password: string;
  role: RegisterRole | "";
  acceptTerms: boolean;
};

export type ApiFieldIssue = {
  field?: string;
  code?: string;
  message?: string;
};

/** RFC 9457 — Problem Details for HTTP APIs */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  correlationId?: string;
  errors?: ApiFieldIssue[];
};
