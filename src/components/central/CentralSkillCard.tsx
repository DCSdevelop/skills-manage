import { Check, X, PackagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentWithStatus, SkillWithLinks } from "@/types";
import { cn } from "@/lib/utils";

// ─── Platform Link Badge ──────────────────────────────────────────────────────

interface PlatformBadgeProps {
  agent: AgentWithStatus;
  isLinked: boolean;
}

function PlatformBadge({ agent, isLinked }: PlatformBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs",
        isLinked ? "text-green-600 dark:text-green-400" : "text-muted-foreground/60"
      )}
      title={`${agent.display_name}: ${isLinked ? "linked" : "not linked"}`}
    >
      {isLinked ? (
        <Check className="size-3 shrink-0" aria-label="linked" />
      ) : (
        <X className="size-3 shrink-0" aria-label="not linked" />
      )}
      <span className="truncate max-w-[5rem]">{agent.display_name}</span>
    </div>
  );
}

// ─── CentralSkillCard ─────────────────────────────────────────────────────────

interface CentralSkillCardProps {
  skill: SkillWithLinks;
  /** All agents except the 'central' agent itself. */
  agents: AgentWithStatus[];
  onInstallClick: (skill: SkillWithLinks) => void;
  className?: string;
}

export function CentralSkillCard({
  skill,
  agents,
  onInstallClick,
  className,
}: CentralSkillCardProps) {
  // Only show non-central agents for link status.
  const targetAgents = agents.filter((a) => a.id !== "central");

  return (
    <Card size="sm" className={cn("", className)}>
      <CardContent className="space-y-3">
        {/* Header row: name + install button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="font-medium text-sm text-foreground truncate">
              {skill.name}
            </div>
            {skill.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {skill.description}
              </p>
            )}
          </div>

          {/* Install to... button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInstallClick(skill)}
            className="shrink-0"
            aria-label={`Install ${skill.name} to platforms`}
          >
            <PackagePlus className="size-3.5" />
            <span>Install to...</span>
          </Button>
        </div>

        {/* Per-platform link status */}
        {targetAgents.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {targetAgents.map((agent) => (
              <PlatformBadge
                key={agent.id}
                agent={agent}
                isLinked={skill.linked_agents.includes(agent.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
