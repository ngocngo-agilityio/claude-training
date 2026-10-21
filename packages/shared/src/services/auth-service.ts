import axios from "axios";
import { getApiConfig } from "../config/api.ts";
import { API_PATHS } from "../constants/api.ts";
import { ERROR_MESSAGES } from "../constants/errors.ts";
import { httpClient } from "./http-client.ts";
import type {
  LoginFormValues,
  LoginResponse,
  LoginResult,
} from "../types/auth.ts";

/** Authenticates the user and returns a UI-friendly result. */
export const login = async (payload: LoginFormValues): Promise<LoginResult> => {
  try {
    const data = await httpClient.post<LoginResponse, LoginFormValues>(
      `${getApiConfig().restaurantsApiDomain}${API_PATHS.LOGIN}`,
      payload,
    );

    return { success: true, data };
  } catch (error) {
    let message = ERROR_MESSAGES.LOGIN_FAILED;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData: unknown = error.response?.data;

      // Rejected credentials get one generic message, so the UI never shows
      // raw API text such as "Cannot find user" or reveals which emails exist.
      if (status === 400 || status === 401) {
        message = ERROR_MESSAGES.LOGIN_FAILED;
      } else if (typeof responseData === "string") {
        message = responseData;
      } else if (
        responseData &&
        typeof responseData === "object" &&
        "message" in responseData &&
        typeof responseData.message === "string"
      ) {
        message = responseData.message;
      }
    }

    return { success: false, error: message };
  }
};
