"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserSession } from "@stacks/connect";
import {
  clearAnnotationNote,
  fetchAnnotationNote,
  fetchMaxNoteLength,
  saveAnnotationNote,
} from "@/lib/annotations-client";

interface TransactionNoteProps {
  txId: string;
  viewerAddress?: string;
  userSession?: UserSession;
}

export function TransactionNote({ txId, viewerAddress, userSession }: TransactionNoteProps) {
  const [maxLength, setMaxLength] = useState<number>(280);
  const [note, setNote] = useState<string>("");
  const [draft, setDraft] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMaxNoteLength()
      .then((value) => {
        if (!cancelled) {
          setMaxLength(value);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load annotation settings.";
          setConfigError(message);
          setError(message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!viewerAddress || configError) {
      setNote("");
      setDraft("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAnnotationNote({ ownerAddress: viewerAddress, txId })
      .then((value) => {
        if (!cancelled) {
          const existing = value ?? "";
          setNote(existing);
          setDraft(existing);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load note.";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [viewerAddress, txId, configError]);

  const hasChanges = useMemo(() => draft !== note && draft.trim().length > 0, [draft, note]);

  const handleSave = useCallback(async () => {
    if (!viewerAddress || !userSession) {
      setError("Connect your wallet to save notes.");
      return;
    }
    if (configError) {
      setError(configError);
      return;
    }

    const trimmed = draft.trim();
    if (!trimmed.length) {
      setError("Note cannot be empty.");
      return;
    }
    if (trimmed.length > maxLength) {
      setError(`Note cannot exceed ${maxLength} characters.`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveAnnotationNote({ txId, note: draft, userSession });
      setNote(draft);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save note.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [draft, maxLength, txId, userSession, viewerAddress, configError]);

  const handleClear = useCallback(async () => {
    if (!viewerAddress || !userSession) {
      setError("Connect your wallet to clear notes.");
      return;
    }
    if (configError) {
      setError(configError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await clearAnnotationNote({ txId, userSession });
      setNote("");
      setDraft("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clear note.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [txId, userSession, viewerAddress, configError]);

  if (configError) {
    return (
      <div className="rounded-md border border-gray-800 bg-gray-900/40 p-3 text-sm text-red-400">
        {configError}
      </div>
    );
  }

  if (!viewerAddress) {
    return (
      <div className="rounded-md border border-dashed border-gray-700 bg-gray-900/30 p-3 text-sm text-gray-400">
        Connect your wallet to store personal notes for this transaction.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-800 bg-gray-900/40 p-3">
      <label className="flex flex-col gap-2 text-sm text-gray-300">
        <span className="font-medium">Personal note</span>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={maxLength}
          disabled={loading || saving}
          className="h-24 w-full resize-none rounded-md border border-gray-700 bg-transparent p-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Add context for yourself..."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <span>
          {draft.length}/{maxLength} characters
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving || loading}
            className="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-blue-500/40 hover:bg-blue-600"
          >
            {saving ? "Saving..." : "Save note"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={saving || loading || note.length === 0}
            className="rounded-md border border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors disabled:cursor-not-allowed disabled:border-gray-700/50 disabled:text-gray-500 hover:border-red-400 hover:text-red-400"
          >
            Clear
          </button>
        </div>
      </div>

      {error && <span className="text-sm text-red-400">{error}</span>}

      {loading && <span className="text-xs text-gray-500">Loading note…</span>}
    </div>
  );
}
