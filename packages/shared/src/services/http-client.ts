import axios, { type AxiosRequestConfig } from "axios";
import { getApiConfig } from "../config/api.ts";
import { HTTP_STATUS_CODES } from "../constants/http.ts";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Lets the app clear the saved login when the server rejects an expired or
// invalid token.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === HTTP_STATUS_CODES.UNAUTHORIZED
    ) {
      getApiConfig().onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);

const get = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<TResponse> => {
  const { data } = await axiosInstance.get<TResponse>(url, config);
  return data;
};

const post = async <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> => {
  const { data } = await axiosInstance.post<TResponse>(url, body, config);
  return data;
};

const put = async <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> => {
  const { data } = await axiosInstance.put<TResponse>(url, body, config);
  return data;
};

const patch = async <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> => {
  const { data } = await axiosInstance.patch<TResponse>(url, body, config);
  return data;
};

const remove = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<TResponse> => {
  const { data } = await axiosInstance.delete<TResponse>(url, config);
  return data;
};

export const httpClient = {
  get,
  post,
  put,
  patch,
  delete: remove,
};
