import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { STORAGE_KEYS, TENANT_HEADER } from "@/constants";
import { getActiveTenantId } from "@/store/tenant.store";

const baseURL = import.meta.env.VITE_API_URL ?? "/api";

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // JWT (contains tenantId — backend validates the binding)
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
      const token = parsed.state?.accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    /* noop */
  }

  // Active tenant header — NestJS reads it via `TenantInterceptor`.
  const tenantId = getActiveTenantId();
  if (tenantId && config.headers) {
    config.headers[TENANT_HEADER] = tenantId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.session);
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    if (status === 403 && typeof window !== "undefined") {
      // Forbidden by RBAC or tenant mismatch
      window.location.href = "/403";
    }
    return Promise.reject(error);
  }
);
