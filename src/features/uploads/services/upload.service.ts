import { endpoints } from "@/config/endpoints.config";
import { envConfig } from "@/config/env.config";
import { uploadWithProgress } from "@/modules/http/api-client";

export type UploadResult = { id: string; url: string; width: number; height: number };

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadRejection = "unsupported_image_type" | "payload_too_large";

/** Local validation before any byte is sent; mirrors the backend limits. */
export function validateImage(file: File): UploadRejection | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "unsupported_image_type";
  if (file.size > envConfig.maxUploadBytes) return "payload_too_large";
  return null;
}

export const uploadService = {
  upload: (tripId: string, file: File, onProgress?: (fraction: number) => void, signal?: AbortSignal) => {
    const form = new FormData();
    form.append("file", file);
    return uploadWithProgress<UploadResult>(endpoints.trips.uploads(tripId), form, onProgress, signal);
  },
};
