"use client";

import { useCallback, useEffect, useRef } from "react";
import { deleteUploadedFile, normalizeUploadedPath } from "@/lib/uploaded-file";

type TrackUploadOptions = {
  /** Path bị thay thế (upload mới / đổi ảnh) */
  replaces?: string | null;
};

/**
 * Theo dõi file upload trong phiên soạn thảo; xóa khi rời form mà chưa Lưu thành công.
 * `savedPaths`: path đã có trên server khi mở form (từ DB) — không xóa khi hủy.
 */
export function usePendingUploads(savedPaths: ReadonlySet<string> = new Set()) {
  const pendingRef = useRef<Set<string>>(new Set());
  const committedRef = useRef(false);
  const savedPathsRef = useRef(savedPaths);

  savedPathsRef.current = savedPaths;

  const isSavedPath = useCallback((path: string) => {
    return savedPathsRef.current.has(path);
  }, []);

  const trackUpload = useCallback(
    (pathOrUrl: string | null | undefined, options?: TrackUploadOptions) => {
      const path = normalizeUploadedPath(pathOrUrl);
      if (!path) return;

      const replaces = normalizeUploadedPath(options?.replaces);
      if (replaces && pendingRef.current.has(replaces)) {
        pendingRef.current.delete(replaces);
        void deleteUploadedFile(replaces);
      }

      if (!isSavedPath(path)) {
        pendingRef.current.add(path);
      }
    },
    [isSavedPath]
  );

  const commit = useCallback(() => {
    committedRef.current = true;
    pendingRef.current.clear();
  }, []);

  const rollback = useCallback(async (paths: Iterable<string | null | undefined>) => {
    const toDelete: string[] = [];
    for (const raw of paths) {
      const path = normalizeUploadedPath(raw);
      if (!path || isSavedPath(path)) continue;
      toDelete.push(path);
      pendingRef.current.delete(path);
    }
    await Promise.all(toDelete.map((p) => deleteUploadedFile(p)));
  }, [isSavedPath]);

  const discard = useCallback(async () => {
    const paths = [...pendingRef.current];
    pendingRef.current.clear();
    await Promise.all(paths.map((p) => deleteUploadedFile(p)));
  }, []);

  useEffect(() => {
    return () => {
      if (!committedRef.current) {
        void discard();
      }
    };
  }, [discard]);

  return { trackUpload, commit, rollback, discard };
}
