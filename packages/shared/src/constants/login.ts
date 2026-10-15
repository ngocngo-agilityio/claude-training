import type { LoginFormValues } from "../types/auth.ts";
import { ERROR_MESSAGES } from "./errors.ts";
import { REGEX_PATTERNS } from "./regex.ts";

export const LOGIN_FORM_DEFAULT_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export const LOGIN_VALIDATION_RULES = {
  email: {
    required: ERROR_MESSAGES.FIELD_REQUIRED("Email"),
    pattern: {
      value: REGEX_PATTERNS.EMAIL,
      message: ERROR_MESSAGES.EMAIL_INVALID,
    },
  },
  password: {
    required: ERROR_MESSAGES.FIELD_REQUIRED("Password"),
    minLength: {
      value: 6,
      message: ERROR_MESSAGES.PASSWORD_MIN_LENGTH,
    },
  },
} as const;
