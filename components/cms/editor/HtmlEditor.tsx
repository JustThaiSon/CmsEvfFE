"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button, Divider, Space, Typography, Upload, message } from "antd";
import type { UploadProps } from "antd";
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  DownloadOutlined,
  EyeOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { RESPONSE_CODE } from "@/constants/auth";
import {
  HTML_MEDIA_FOLDER,
  fetchHtmlContent,
  isMediaPath,
  normalizeMediaPath,
  uploadHtmlContent,
} from "@/lib/html-media";
import { normalizeUploadedPath } from "@/lib/uploaded-file";
import { uploadMedia } from "@/services/media.api";
import { resolveMediaUrl } from "@/utils/media-url";
import "./HtmlEditor.scss";

export type HtmlEditorDict = {
  uploadHtml: string;
  uploadToServer: string;
  downloadHtml: string;
  uploadImage: string;
  preview: string;
  source: string;
  visual: string;
  htmlOnly: string;
  imageUploadSuccess: string;
  imageUploadError: string;
  htmlLoadSuccess: string;
  htmlLoadError: string;
  htmlUploadSuccess: string;
  htmlUploadError: string;
  linkPrompt: string;
  savedLink: string;
  loadingHtml: string;
};

export type HtmlEditorHandle = {
  getContent: () => string;
  uploadToServer: () => Promise<string | null>;
};

type PendingUploadOptions = {
  replaces?: string | null;
};

type HtmlEditorProps = {
  value?: string;
  onChange?: (mediaPath: string) => void;
  onHtmlDraftChange?: (html: string) => void;
  /** Gọi khi upload file lên server (chưa Lưu form) — parent xóa nếu user hủy */
  onPendingUpload?: (path: string, options?: PendingUploadOptions) => void;
  /** Path đã lưu DB khi mở form — không coi là rác */
  savedMediaPaths?: string[];
  dict: HtmlEditorDict;
  fileNamePrefix?: string;
  htmlUploadFolder?: string;
  imageUploadFolder?: string;
};

function normalizeEditorHtmlPath(path: string, folder: string): string {
  const uploaded = normalizeUploadedPath(path);
  if (!uploaded) return "";
  if (uploaded.startsWith("/uploads/")) return uploaded;
  const fileName = uploaded.replace(/^\/+/, "");
  if (/\.html?$/i.test(fileName)) {
    return `/uploads/${folder}/${fileName}`;
  }
  return uploaded;
}

function getLoadKey(value?: string): string {
  if (!value?.trim()) return "";
  return isMediaPath(value) ? normalizeMediaPath(value) : value.trim();
}

const HtmlEditor = forwardRef<HtmlEditorHandle, HtmlEditorProps>(function HtmlEditor(
  {
    value = "",
    onChange,
    onHtmlDraftChange,
    onPendingUpload,
    savedMediaPaths = [],
    dict,
    fileNamePrefix = "description",
    htmlUploadFolder = HTML_MEDIA_FOLDER,
    imageUploadFolder = "job-description",
  },
  ref
) {
  const savedSet = useRef(new Set(savedMediaPaths.map((p) => normalizeUploadedPath(p)).filter(Boolean)));
  savedSet.current = new Set(savedMediaPaths.map((p) => normalizeUploadedPath(p)).filter(Boolean));

  const notifyPending = useCallback(
    (path: string, options?: PendingUploadOptions) => {
      const normalized = normalizeEditorHtmlPath(path, htmlUploadFolder);
      if (!normalized || savedSet.current.has(normalized)) return;
      onPendingUpload?.(normalized, options);
    },
    [htmlUploadFolder, onPendingUpload]
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const onHtmlDraftChangeRef = useRef(onHtmlDraftChange);
  const loadedKeyRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const [mode, setMode] = useState<"visual" | "source" | "preview">("visual");
  const [htmlContent, setHtmlContent] = useState("");
  const [mediaPath, setMediaPath] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [uploading, setUploading] = useState(false);

  onHtmlDraftChangeRef.current = onHtmlDraftChange;

  const setEditorHtml = useCallback((html: string) => {
    setHtmlContent(html);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  }, []);

  const notifyDraftChange = useCallback((html: string) => {
    onHtmlDraftChangeRef.current?.(html);
  }, []);

  const getContent = useCallback(() => {
    if (mode === "source") {
      return htmlContent;
    }
    return editorRef.current?.innerHTML ?? htmlContent;
  }, [mode, htmlContent]);

  const uploadCurrentHtml = useCallback(async () => {
    const content = getContent();
    if (!content.trim()) {
      message.warning(dict.htmlUploadError);
      return null;
    }

    setUploading(true);
    try {
      const previousPath = mediaPath || (isMediaPath(value) ? normalizeMediaPath(value) : "");
      const path = await uploadHtmlContent(content, htmlUploadFolder, fileNamePrefix);
      if (path) {
        const normalized = normalizeEditorHtmlPath(path, htmlUploadFolder);
        notifyPending(normalized, { replaces: previousPath || undefined });
        setMediaPath(normalized);
        loadedKeyRef.current = normalized;
        onChange?.(normalized);
        message.success(dict.htmlUploadSuccess);
        return normalized;
      }
      message.error(dict.htmlUploadError);
      return null;
    } catch {
      message.error(dict.htmlUploadError);
      return null;
    } finally {
      setUploading(false);
    }
  }, [
    getContent,
    dict.htmlUploadError,
    dict.htmlUploadSuccess,
    fileNamePrefix,
    onChange,
    mediaPath,
    value,
    htmlUploadFolder,
    notifyPending,
  ]);

  useImperativeHandle(ref, () => ({
    getContent,
    uploadToServer: uploadCurrentHtml,
  }));

  useEffect(() => {
    const loadKey = getLoadKey(value);

    if (loadedKeyRef.current === loadKey) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      isLoadingRef.current = true;

      if (!loadKey) {
        if (!cancelled) {
          loadedKeyRef.current = loadKey;
          setEditorHtml("");
          setMediaPath("");
          notifyDraftChange("");
        }
        isLoadingRef.current = false;
        return;
      }

      if (isMediaPath(value)) {
        const path = normalizeMediaPath(value);
        setMediaPath(path);
        setLoadingHtml(true);
        try {
          const html = await fetchHtmlContent(path);
          if (cancelled) return;
          loadedKeyRef.current = loadKey;
          setEditorHtml(html);
          notifyDraftChange(html);
        } catch {
          if (cancelled) return;
          loadedKeyRef.current = null;
          message.error(dict.htmlLoadError);
          setEditorHtml("");
          notifyDraftChange("");
        } finally {
          if (!cancelled) setLoadingHtml(false);
          isLoadingRef.current = false;
        }
        return;
      }

      if (!cancelled) {
        loadedKeyRef.current = loadKey;
        setMediaPath("");
        setEditorHtml(loadKey);
        notifyDraftChange(loadKey);
      }
      isLoadingRef.current = false;
    };

    void load();

    return () => {
      cancelled = true;
      isLoadingRef.current = false;
    };
  }, [value, dict.htmlLoadError, setEditorHtml, notifyDraftChange]);

  const handleVisualInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      notifyDraftChange(html);
    }
  };

  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    handleVisualInput();
  };

  const handleLink = () => {
    const url = window.prompt(dict.linkPrompt);
    if (url) exec("createLink", url);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const res = await uploadMedia(file, imageUploadFolder);
      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        notifyPending(res.data);
        const url = resolveMediaUrl(res.data);
        exec("insertImage", url);
        message.success(dict.imageUploadSuccess);
      } else {
        message.error(res.message || dict.imageUploadError);
      }
    } catch {
      message.error(dict.imageUploadError);
    }
  };

  const imageUploadProps: UploadProps = {
    accept: "image/jpeg,image/png,image/gif,image/webp",
    showUploadList: false,
    beforeUpload: (file) => {
      handleImageUpload(file);
      return false;
    },
  };

  const htmlUploadProps: UploadProps = {
    accept: ".html,.htm,text/html",
    showUploadList: false,
    beforeUpload: async (file) => {
      const isHtml =
        file.name.toLowerCase().endsWith(".html") ||
        file.name.toLowerCase().endsWith(".htm") ||
        file.type.includes("html");
      if (!isHtml) {
        message.error(dict.htmlOnly);
        return Upload.LIST_IGNORE;
      }

      setUploading(true);
      try {
        const previousPath = mediaPath || (isMediaPath(value) ? normalizeMediaPath(value) : "");
        const res = await uploadMedia(file, htmlUploadFolder);
        if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
          const path = normalizeEditorHtmlPath(res.data, htmlUploadFolder);
          notifyPending(path, { replaces: previousPath || undefined });
          setMediaPath(path);
          loadedKeyRef.current = path;
          onChange?.(path);
          const text = await file.text();
          const html = extractBodyFromFile(text);
          setEditorHtml(html);
          notifyDraftChange(html);
          setMode("visual");
          message.success(dict.htmlLoadSuccess);
        } else {
          message.error(res.message || dict.htmlUploadError);
        }
      } catch {
        message.error(dict.htmlUploadError);
      } finally {
        setUploading(false);
      }
      return false;
    },
  };

  const extractBodyFromFile = (text: string) => {
    try {
      const doc = new DOMParser().parseFromString(text, "text/html");
      return doc.body?.innerHTML?.trim() || text;
    } catch {
      return text;
    }
  };

  const handleDownloadHtml = () => {
    const html = getContent() || "<p></p>";
    const blob = new Blob(
      [`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`],
      { type: "text/html;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileNamePrefix}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const switchToSource = () => {
    setHtmlContent(getContent());
    setMode("source");
  };

  const switchToVisual = () => {
    setEditorHtml(htmlContent);
    setMode("visual");
  };

  return (
    <div className="html-editor">
      {mediaPath && (
        <Typography.Text type="secondary" className="block mb-2 text-xs">
          {dict.savedLink}:{" "}
          <a href={resolveMediaUrl(mediaPath)} target="_blank" rel="noreferrer">
            {mediaPath}
          </a>
        </Typography.Text>
      )}

      <Space wrap className="html-editor__toolbar mb-2">
        {mode === "visual" && (
          <>
            <Button size="small" icon={<BoldOutlined />} onClick={() => exec("bold")} />
            <Button size="small" icon={<ItalicOutlined />} onClick={() => exec("italic")} />
            <Button size="small" icon={<UnderlineOutlined />} onClick={() => exec("underline")} />
            <Divider orientation="vertical" />
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => exec("insertUnorderedList")}
            />
            <Button
              size="small"
              icon={<OrderedListOutlined />}
              onClick={() => exec("insertOrderedList")}
            />
            <Divider orientation="vertical" />
            <Button size="small" icon={<AlignLeftOutlined />} onClick={() => exec("justifyLeft")} />
            <Button
              size="small"
              icon={<AlignCenterOutlined />}
              onClick={() => exec("justifyCenter")}
            />
            <Button
              size="small"
              icon={<AlignRightOutlined />}
              onClick={() => exec("justifyRight")}
            />
            <Divider orientation="vertical" />
            <Button size="small" icon={<LinkOutlined />} onClick={handleLink} />
            <Upload {...imageUploadProps}>
              <Button size="small" icon={<PictureOutlined />}>
                {dict.uploadImage}
              </Button>
            </Upload>
            <Divider orientation="vertical" />
          </>
        )}

        <Upload {...htmlUploadProps}>
          <Button icon={<UploadOutlined />} size="small" loading={uploading}>
            {dict.uploadHtml}
          </Button>
        </Upload>
        <Button
          icon={<CloudUploadOutlined />}
          size="small"
          type="primary"
          loading={uploading}
          onClick={uploadCurrentHtml}
        >
          {dict.uploadToServer}
        </Button>
        <Button icon={<DownloadOutlined />} size="small" onClick={handleDownloadHtml}>
          {dict.downloadHtml}
        </Button>
        <Button
          icon={<CodeOutlined />}
          size="small"
          type={mode === "source" ? "primary" : "default"}
          onClick={() => (mode === "source" ? switchToVisual() : switchToSource())}
        >
          {mode === "source" ? dict.visual : dict.source}
        </Button>
        <Button
          icon={<EyeOutlined />}
          size="small"
          type={mode === "preview" ? "primary" : "default"}
          onClick={() => setMode(mode === "preview" ? "visual" : "preview")}
        >
          {dict.preview}
        </Button>
      </Space>

      <div className="html-editor__body relative">
        {loadingHtml && (
          <div className="html-editor__loading absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            {dict.loadingHtml}
          </div>
        )}

        {mode === "source" && (
          <textarea
            className="html-editor__source"
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              notifyDraftChange(e.target.value);
            }}
            rows={14}
            spellCheck={false}
          />
        )}

        {mode === "visual" && (
          <div
            ref={editorRef}
            className="html-editor__content"
            contentEditable
            suppressContentEditableWarning
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
          />
        )}

        {mode === "preview" && (
          <div className="html-editor__preview">
            <Typography.Text type="secondary" className="block mb-2">
              {dict.preview}
            </Typography.Text>
            <div
              className="html-editor__preview-content"
              dangerouslySetInnerHTML={{ __html: htmlContent || "<p></p>" }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default HtmlEditor;
