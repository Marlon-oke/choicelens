"use client";

import { useActionState, useRef } from "react";
import { adminUploadProductPhoto, type ActionState } from "@/lib/actions";

export default function AdminPhotoUpload({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    adminUploadProductPhoto,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form
        ref={formRef}
        action={action}
        style={{ display: "flex", gap: 6, alignItems: "center" }}
      >
        <input type="hidden" name="id" value={id} />
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          aria-label={`Foto untuk ${name}`}
          style={{ fontSize: 11, maxWidth: 150 }}
        />
        <button
          type="submit"
          disabled={pending}
          style={{
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {pending ? "…" : "Upload"}
        </button>
      </form>
      {state.message && (
        <p style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, margin: "4px 0 0" }}>
          {state.message}
        </p>
      )}
      {state.notice && (
        <p style={{ fontSize: 11, color: "#166534", fontWeight: 700, margin: "4px 0 0" }}>
          {state.notice}
        </p>
      )}
    </div>
  );
}
