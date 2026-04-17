import { create } from "zustand";
import { invoke, isTauriRuntime } from "@/lib/tauri";
import { ScannedSkill } from "@/types";

const BROWSER_FIXTURE_SKILLS_BY_AGENT: Record<string, ScannedSkill[]> = {
  "claude-code": [
    {
      id: "fixture-central-skill",
      name: "fixture-central-skill",
      description: "Installed browser validation fixture for platform drawer flows.",
      file_path: "~/.claude/skills/fixture-central-skill/SKILL.md",
      dir_path: "~/.claude/skills/fixture-central-skill",
      link_type: "symlink",
      symlink_target: "~/.agents/skills/fixture-central-skill",
      is_central: true,
    },
  ],
  cursor: [
    {
      id: "fixture-central-skill",
      name: "fixture-central-skill",
      description: "Installed browser validation fixture for platform drawer flows.",
      file_path: "~/.cursor/skills/fixture-central-skill/SKILL.md",
      dir_path: "~/.cursor/skills/fixture-central-skill",
      link_type: "symlink",
      symlink_target: "~/.agents/skills/fixture-central-skill",
      is_central: true,
    },
  ],
};

// ─── State ────────────────────────────────────────────────────────────────────

interface SkillState {
  skillsByAgent: Record<string, ScannedSkill[]>;
  loadingByAgent: Record<string, boolean>;
  error: string | null;

  // Actions
  getSkillsByAgent: (agentId: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSkillStore = create<SkillState>((set) => ({
  skillsByAgent: {},
  loadingByAgent: {},
  error: null,

  /**
   * Fetch skills for a specific agent by invoking the Tauri backend command.
   * Results are cached per agentId in skillsByAgent.
   */
  getSkillsByAgent: async (agentId: string) => {
    set((state) => ({
      loadingByAgent: { ...state.loadingByAgent, [agentId]: true },
      error: null,
    }));
    if (!isTauriRuntime()) {
      set((state) => ({
        skillsByAgent: {
          ...state.skillsByAgent,
          [agentId]: BROWSER_FIXTURE_SKILLS_BY_AGENT[agentId] ?? [],
        },
        loadingByAgent: { ...state.loadingByAgent, [agentId]: false },
      }));
      return;
    }
    try {
      const skills = await invoke<ScannedSkill[]>("get_skills_by_agent", {
        agentId,
      });
      set((state) => ({
        skillsByAgent: { ...state.skillsByAgent, [agentId]: skills },
        loadingByAgent: { ...state.loadingByAgent, [agentId]: false },
      }));
    } catch (err) {
      set((state) => ({
        error: String(err),
        loadingByAgent: { ...state.loadingByAgent, [agentId]: false },
      }));
    }
  },
}));
