/**
 * NextUp Matching Engine - Skill Normalization and Aliases
 *
 * This module provides deterministic skill normalization and alias matching.
 * Skills are normalized to lowercase, trimmed, and matched against known alias groups.
 *
 * No embeddings, no fuzzy matching, no AI - purely deterministic rules.
 */

/**
 * Skill alias groups
 * Skills within a group are considered equivalent for matching purposes
 */
const SKILL_ALIAS_GROUPS: string[][] = [
  // Leadership and management
  [
    "leadership",
    "team leadership",
    "crew leadership",
    "crew management",
    "people management",
    "supervision",
    "team management",
  ],

  // Project coordination
  [
    "project management",
    "project coordination",
    "project planning",
    "project execution",
  ],

  // Construction and field work
  [
    "construction",
    "construction operations",
    "field construction",
    "construction work",
  ],

  // Telecommunications
  [
    "telecommunications",
    "telecom",
    "wireless",
    "cell tower",
    "tower construction",
    "telecommunications construction",
  ],

  // Safety
  [
    "safety",
    "safety management",
    "safety compliance",
    "osha",
    "workplace safety",
  ],

  // Documentation
  [
    "project documentation",
    "construction documentation",
    "field documentation",
    "documentation",
    "record keeping",
  ],

  // Scheduling
  [
    "scheduling",
    "project scheduling",
    "construction scheduling",
    "schedule coordination",
    "planning",
  ],

  // Quality control
  [
    "quality control",
    "quality assurance",
    "qa/qc",
    "quality management",
  ],

  // Material coordination
  [
    "material coordination",
    "materials management",
    "logistics",
    "material handling",
  ],

  // Field operations
  [
    "field operations",
    "field management",
    "field coordination",
    "site management",
  ],

  // Client communication
  [
    "client communication",
    "customer service",
    "client relations",
    "stakeholder communication",
  ],

  // Troubleshooting
  [
    "troubleshooting",
    "problem solving",
    "issue resolution",
  ],

  // BIM and technical tools
  [
    "bim",
    "building information modeling",
    "revit",
  ],

  // Engineering
  [
    "engineering",
    "technical engineering",
    "project engineering",
  ],

  // Crew/team supervision variants
  [
    "crew lead",
    "foreman",
    "field supervisor",
    "site supervisor",
    "crew foreman",
  ],

  // Fiber optics
  [
    "fiber optics",
    "fiber",
    "fiber installation",
    "fiber construction",
  ],

  // Estimating
  [
    "estimating",
    "cost estimation",
    "project estimation",
    "bid preparation",
  ],

  // Blueprint reading
  [
    "blueprint reading",
    "blueprints",
    "reading plans",
    "plan interpretation",
  ],
];

/**
 * Build reverse lookup map: normalized skill → canonical skill
 */
const skillAliasMap = new Map<string, string>();

for (const group of SKILL_ALIAS_GROUPS) {
  // First skill in group is the canonical form
  const canonical = normalizeSkill(group[0]);

  for (const alias of group) {
    const normalized = normalizeSkill(alias);
    skillAliasMap.set(normalized, canonical);
  }
}

/**
 * Normalize a skill name to a canonical form
 * - Lowercase
 * - Trim whitespace
 * - Collapse multiple spaces
 * - Remove certain punctuation
 */
export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/[\/\-_]/g, " ") // Replace slashes, hyphens, underscores with space
    .replace(/\s+/g, " ") // Collapse again after replacements
    .trim();
}

/**
 * Get canonical form of a skill
 * If skill is in an alias group, returns the canonical form
 * Otherwise returns the normalized skill itself
 */
export function getCanonicalSkill(skill: string): string {
  const normalized = normalizeSkill(skill);
  return skillAliasMap.get(normalized) || normalized;
}

/**
 * Check if two skills match (exact or via alias)
 */
export function skillsMatch(skill1: string, skill2: string): boolean {
  const canonical1 = getCanonicalSkill(skill1);
  const canonical2 = getCanonicalSkill(skill2);
  return canonical1 === canonical2;
}

/**
 * Normalize and deduplicate a list of skills
 * Returns canonical forms
 */
export function normalizeSkillList(skills: string[]): string[] {
  const canonicalSkills = new Set<string>();

  for (const skill of skills) {
    const canonical = getCanonicalSkill(skill);
    canonicalSkills.add(canonical);
  }

  // Return as sorted array for determinism
  return Array.from(canonicalSkills).sort();
}

/**
 * Find matching skills between two lists
 * Returns array of matched canonical skills
 */
export function findMatchingSkills(
  userSkills: string[],
  jobSkills: string[]
): string[] {
  const normalizedUserSkills = normalizeSkillList(userSkills);
  const normalizedJobSkills = normalizeSkillList(jobSkills);

  const matches: string[] = [];

  for (const jobSkill of normalizedJobSkills) {
    if (normalizedUserSkills.includes(jobSkill)) {
      matches.push(jobSkill);
    }
  }

  return matches.sort(); // Deterministic ordering
}

/**
 * Find missing skills (job requires but user doesn't have)
 * Returns array of canonical skills
 */
export function findMissingSkills(
  userSkills: string[],
  jobSkills: string[]
): string[] {
  const normalizedUserSkills = normalizeSkillList(userSkills);
  const normalizedJobSkills = normalizeSkillList(jobSkills);

  const missing: string[] = [];

  for (const jobSkill of normalizedJobSkills) {
    if (!normalizedUserSkills.includes(jobSkill)) {
      missing.push(jobSkill);
    }
  }

  return missing.sort(); // Deterministic ordering
}

/**
 * Extract skills from job requirements text
 * Uses simple pattern matching - not sophisticated NLP
 * Returns normalized skill names found in known alias groups
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];

  const normalizedText = normalizeSkill(text);
  const foundSkills = new Set<string>();

  // Check each canonical skill to see if it appears in text
  for (const [alias, canonical] of skillAliasMap.entries()) {
    // Simple word boundary check
    const pattern = new RegExp(`\\b${alias}\\b`, "i");
    if (pattern.test(normalizedText)) {
      foundSkills.add(canonical);
    }
  }

  return Array.from(foundSkills).sort();
}
