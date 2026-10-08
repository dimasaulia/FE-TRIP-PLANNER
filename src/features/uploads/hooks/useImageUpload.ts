"use client";

import { useCallback, useState } from "react";
import { errorMessageKey } from "@/modules/http/error-message";
import { usePreferences } from "@/modules/preferences";
import { toast } from "@/shared/components/Toast";
import { uploadService, validateImage, type UploadResult } from "@/features/uploads/services/upload.service";

type UploadState = { previewUrl: string | null; progress: number; uploading: boolean };

/**
 * Hides the two-step upload: validate locally, show an instant object URL
 * preview, POST multipart, hand back `{url, width, height}`.
 */
export function useImageUpload(tripId: string | null) {
  const { t } = usePreferences();
  const [state, setState] = useState<UploadState>({ previewUrl: null, progress: 0, uploading: false });

  const upload = useCallback(
    async (file: File, options: { retry?: () => void; targetTripId?: string } = {}): Promise<UploadResult | null> => {
      const target = options.targetTripId ?? tripId;
      const rejection = validateImage(file);
      if (rejection) {
        toast({ message: t(`errors.${rejection}`), tone: "error" });
        return null;
      }
      if (!target) return null;

      const previewUrl = URL.createObjectURL(file);
      setState({ previewUrl, progress: 0, uploading: true });
      try {
        const result = await uploadService.upload(target, file, (progress) =>
          setState((current) => ({ ...current, progress })),
        );
        setState({ previewUrl: null, progress: 1, uploading: false });
        return result;
      } catch (error) {
        setState({ previewUrl: null, progress: 0, uploading: false });
        toast({
          message: t(errorMessageKey(error)),
          tone: "error",
          action: options.retry ? { label: t("common.retry"), onClick: options.retry } : undefined,
        });
        return null;
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [t, tripId],
  );

  return { ...state, upload };
}
