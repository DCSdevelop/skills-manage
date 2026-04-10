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
import { Checkbox } from "@/components/ui/checkbox";
import { AgentWithStatus, CollectionBatchInstallResult } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CollectionInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionName: string;
  skillCount: number;
  agents: AgentWithStatus[];
  onInstall: (agentIds: string[]) => Promise<CollectionBatchInstallResult>;
}

// ─── CollectionInstallDialog ──────────────────────────────────────────────────

export function CollectionInstallDialog({
  open,
  onOpenChange,
  collectionName,
  skillCount,
  agents,
  onInstall,
}: CollectionInstallDialogProps) {
  const targetAgents = agents.filter((a) => a.id !== "central");

  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CollectionBatchInstallResult | null>(null);

  // Reset when dialog opens.
  useEffect(() => {
    if (open) {
      // Default: select all detected agents.
      const initial = new Set<string>(
        targetAgents.filter((a) => a.is_detected).map((a) => a.id)
      );
      setSelectedAgentIds(initial);
      setError(null);
      setResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleToggle(agentId: string, checked: boolean) {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(agentId);
      else next.delete(agentId);
      return next;
    });
  }

  async function handleInstall() {
    const agentIds = Array.from(selectedAgentIds);
    if (agentIds.length === 0) {
      setError("Please select at least one platform.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const installResult = await onInstall(agentIds);
      setResult(installResult);
      if (installResult.failed.length === 0) {
        // All succeeded — close dialog.
        onOpenChange(false);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量安装 — {collectionName}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-5">
          <DialogDescription>
            将此 Collection 中的 {skillCount} 个 Skills 以 Symlink 方式安装到选中的平台。
          </DialogDescription>

          {/* Platform checkboxes */}
          <div className="space-y-2.5" role="group" aria-label="Select platforms">
            {targetAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No platforms detected. Add platforms in Settings.
              </p>
            ) : (
              targetAgents.map((agent) => {
                const isChecked = selectedAgentIds.has(agent.id);
                return (
                  <div key={agent.id} className="flex items-center gap-2.5">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleToggle(agent.id, !!checked)
                      }
                      aria-label={agent.display_name}
                    />
                    <span
                      className="text-sm text-foreground flex-1 cursor-pointer select-none"
                      onClick={() => handleToggle(agent.id, !isChecked)}
                    >
                      {agent.display_name}
                    </span>
                    {!agent.is_detected && (
                      <span className="text-xs text-muted-foreground">
                        (not detected)
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Result summary if partial failure */}
          {result && result.failed.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {result.succeeded.length} succeeded, {result.failed.length} failed:
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {result.failed.map((f) => (
                  <li key={f.agent_id} className="text-destructive">
                    {f.agent_id}: {f.error}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="mt-2"
              >
                关闭
              </Button>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </DialogBody>

        {!result && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              onClick={handleInstall}
              disabled={isLoading || selectedAgentIds.size === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Installing...
                </>
              ) : (
                `安装到 ${selectedAgentIds.size} 个平台`
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
