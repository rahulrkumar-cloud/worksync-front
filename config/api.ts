export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "https://work-sync-backend.vercel.app/api"
    : "https://work-sync-backend.vercel.app/api";

export const API_Socket_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://work-sync-backend.vercel.app";

