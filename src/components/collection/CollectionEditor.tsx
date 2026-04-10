import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollectionStore } from "@/stores/collectionStore";
import { Collection } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CollectionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a collection to edit it; null for create mode. */
  collection: Collection | null;
}

// ─── CollectionEditor ─────────────────────────────────────────────────────────

export function CollectionEditor({
  open,
  onOpenChange,
  collection,
}: CollectionEditorProps) {
  const createCollection = useCollectionStore((s) => s.createCollection);
  const updateCollection = useCollectionStore((s) => s.updateCollection);

  const isEditMode = collection !== null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens.
  useEffect(() => {
    if (open) {
      setName(collection?.name ?? "");
      setDescription(collection?.description ?? "");
      setValidationError(null);
      setError(null);
    }
  }, [open, collection]);

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError("名称不能为空");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    setError(null);

    try {
      if (isEditMode) {
        await updateCollection(collection.id, trimmedName, description.trim());
      } else {
        await createCollection(trimmedName, description.trim());
      }
      onOpenChange(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "编辑 Collection" : "新建 Collection"}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          <DialogDescription>
            {isEditMode
              ? "修改 Collection 的名称和描述。"
              : "为新的 Collection 输入名称和描述。"}
          </DialogDescription>

          {/* Name field */}
          <div className="space-y-1.5">
            <label htmlFor="collection-name" className="text-sm font-medium">
              名称 <span className="text-destructive">*</span>
            </label>
            <Input
              id="collection-name"
              placeholder="Collection 名称"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isSubmitting}
              autoFocus
            />
            {validationError && (
              <p className="text-xs text-destructive" role="alert">
                {validationError}
              </p>
            )}
          </div>

          {/* Description field */}
          <div className="space-y-1.5">
            <label htmlFor="collection-description" className="text-sm font-medium">
              描述
            </label>
            <Input
              id="collection-description"
              placeholder="描述 (可选)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Backend error */}
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {isEditMode ? "保存中..." : "创建中..."}
              </>
            ) : isEditMode ? (
              "保存"
            ) : (
              "创建"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
