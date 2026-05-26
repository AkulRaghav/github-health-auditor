/**
 * License Compatibility Checker
 * Scans dependency licenses and flags incompatibilities.
 */

import { getFileContent } from "./github";

export interface LicenseResult {
  projectLicense: string | null;
  totalDeps: number;
  issues: LicenseIssue[];
  breakdown: Record<string, number>;
  score: number;
}

export interface LicenseIssue {
  package: string;
  license: string;
  severity: "error" | "warning" | "info";
  message: string;
}

// License compatibility matrix (simplified)
const COPYLEFT = ["GPL-2.0", "GPL-3.0", "AGPL-3.0", "LGPL-2.1", "LGPL-3.0", "MPL-2.0"];
const PERMISSIVE = ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "0BSD", "Unlicense", "CC0-1.0"];

// Known package licenses (common packages)
const KNOWN_LICENSES: Record<string, string> = {
  "react": "MIT", "react-dom": "MIT", "next": "MIT", "express": "MIT",
  "lodash": "MIT", "axios": "MIT", "typescript": "Apache-2.0",
  "webpack": "MIT", "babel": "MIT", "eslint": "MIT", "prettier": "MIT",
  "jest": "MIT", "mocha": "MIT", "chalk": "MIT", "commander": "MIT",
  "dotenv": "BSD-2-Clause", "uuid": "MIT", "moment": "MIT",
  "mysql": "MIT", "pg": "MIT", "mongodb": "Apache-2.0",
  "sharp": "Apache-2.0", "bcrypt": "MIT", "jsonwebtoken": "MIT",
};

export async function checkLicenses(owner: string, repo: string, token?: string): Promise<LicenseResult> {
  const issues: LicenseIssue[] = [];
  const breakdown: Record<string, number> = {};
  let projectLicense: string | null = null;

  // Get project license from package.json
  let pkgContent: string | null = null;
  try {
    pkgContent = await getFileContent(owner, repo, "package.json", token);
  } catch { /* */ }

  if (!pkgContent) {
    return { projectLicense: null, totalDeps: 0, issues: [], breakdown: {}, score: 50 };
  }

  const pkg = JSON.parse(pkgContent);
  projectLicense = pkg.license || null;
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const depNames = Object.keys(deps);

  // Check each dependency's license
  for (const dep of depNames) {
    const baseName = dep.startsWith("@") ? dep.split("/")[1] || dep : dep;
    const license = KNOWN_LICENSES[baseName] || KNOWN_LICENSES[dep] || "Unknown";

    breakdown[license] = (breakdown[license] || 0) + 1;

    // Check compatibility
    if (projectLicense && PERMISSIVE.includes(projectLicense)) {
      if (COPYLEFT.includes(license)) {
        issues.push({
          package: dep,
          license,
          severity: "error",
          message: `Copyleft license (${license}) in a ${projectLicense} project — may require your code to be open-sourced`,
        });
      }
    }

    if (license === "Unknown" && !dep.startsWith("@types/")) {
      // Don't flag type packages
      issues.push({
        package: dep,
        license: "Unknown",
        severity: "info",
        message: `License not detected for ${dep}`,
      });
    }
  }

  // Score
  let score = 80;
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  score -= errors * 20;
  score -= warnings * 5;
  if (projectLicense) score += 10;
  if (errors === 0 && projectLicense) score += 10;

  return {
    projectLicense,
    totalDeps: depNames.length,
    issues,
    breakdown,
    score: Math.min(100, Math.max(0, score)),
  };
}
