/**
 * Auto-Fix Generator
 * Generates configuration files and templates based on detected stack
 */

interface StackInfo {
  languages: string[];
  hasPackageJson: boolean;
  hasTypeScript: boolean;
  framework?: string;
  testFramework?: string;
  packageManager?: string;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  description: string;
  category: "ci" | "security" | "docs" | "config";
}

export function generateFixes(stackInfo: StackInfo, repoName: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // GitHub Actions CI workflow
  files.push(generateCIWorkflow(stackInfo));

  // Dependabot config
  files.push(generateDependabot(stackInfo));

  // SECURITY.md
  files.push(generateSecurityPolicy(repoName));

  // CONTRIBUTING.md
  files.push(generateContributing(repoName));

  // .gitignore improvements
  files.push(generateGitignore(stackInfo));

  // PR template
  files.push(generatePRTemplate());

  // Issue templates
  files.push(generateBugTemplate());
  files.push(generateFeatureTemplate());

  return files;
}

function generateCIWorkflow(stack: StackInfo): GeneratedFile {
  let content = "";

  if (stack.hasPackageJson) {
    const pm = stack.packageManager || "npm";
    const installCmd = pm === "yarn" ? "yarn install --frozen-lockfile" : pm === "pnpm" ? "pnpm install --frozen-lockfile" : "npm ci";
    const testCmd = pm === "yarn" ? "yarn test" : pm === "pnpm" ? "pnpm test" : "npm test";
    const buildCmd = pm === "yarn" ? "yarn build" : pm === "pnpm" ? "pnpm build" : "npm run build";

    content = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: '${pm}'

      - name: Install dependencies
        run: ${installCmd}

      - name: Build
        run: ${buildCmd}

      - name: Run tests
        run: ${testCmd}

      - name: Run linter
        run: ${pm === "npm" ? "npm run lint" : `${pm} lint`}
        continue-on-error: true

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security audit
        run: npm audit --audit-level=high
        continue-on-error: true
`;
  } else if (stack.languages.includes("Python")) {
    content = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']

    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest flake8

      - name: Lint with flake8
        run: flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

      - name: Run tests
        run: pytest
`;
  } else {
    content = `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: echo "Add your build steps here"
      - name: Test
        run: echo "Add your test steps here"
`;
  }

  return {
    filename: ".github/workflows/ci.yml",
    content,
    description: "Automated CI pipeline with build, test, and security checks",
    category: "ci",
  };
}

function generateDependabot(stack: StackInfo): GeneratedFile {
  const ecosystems: string[] = [];

  if (stack.hasPackageJson) ecosystems.push("npm");
  if (stack.languages.includes("Python")) ecosystems.push("pip");
  if (stack.languages.includes("Go")) ecosystems.push("gomod");
  if (stack.languages.includes("Rust")) ecosystems.push("cargo");

  if (ecosystems.length === 0) ecosystems.push("npm");

  const updates = ecosystems
    .map(
      (eco) => `  - package-ecosystem: "${eco}"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automated"`
    )
    .join("\n\n");

  const content = `version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"

${updates}
`;

  return {
    filename: ".github/dependabot.yml",
    content,
    description: "Automated dependency updates with Dependabot",
    category: "config",
  };
}

function generateSecurityPolicy(repoName: string): GeneratedFile {
  const content = `# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in ${repoName}, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email us at [security@example.com] with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: We aim to patch critical vulnerabilities within 14 days

### Scope

- Authentication and authorization flaws
- Data exposure or leakage
- Remote code execution
- Cross-site scripting (XSS)
- SQL injection
- Dependency vulnerabilities

Thank you for helping keep ${repoName} secure.
`;

  return {
    filename: "SECURITY.md",
    content,
    description: "Security vulnerability reporting policy",
    category: "security",
  };
}

function generateContributing(repoName: string): GeneratedFile {
  const content = `# Contributing to ${repoName}

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork: \`git clone https://github.com/YOUR_USERNAME/${repoName}.git\`
3. Create a branch: \`git checkout -b feature/your-feature-name\`
4. Make your changes
5. Push to your fork: \`git push origin feature/your-feature-name\`
6. Open a Pull Request

## Development Setup

\`\`\`bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint
\`\`\`

## Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features

## Pull Request Guidelines

- Keep PRs focused on a single change
- Write a clear description of what and why
- Reference related issues
- Ensure all tests pass
- Update documentation if needed

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- \`feat:\` New feature
- \`fix:\` Bug fix
- \`docs:\` Documentation changes
- \`style:\` Code style changes (formatting, etc.)
- \`refactor:\` Code refactoring
- \`test:\` Adding or updating tests
- \`chore:\` Maintenance tasks

## Reporting Bugs

Use the GitHub issue tracker with the bug report template. Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

## Questions?

Open a discussion or reach out to the maintainers.

Thank you for contributing! 🎉
`;

  return {
    filename: "CONTRIBUTING.md",
    content,
    description: "Contribution guidelines for new contributors",
    category: "docs",
  };
}

function generateGitignore(stack: StackInfo): GeneratedFile {
  let content = `# Dependencies
node_modules/
vendor/
.venv/
__pycache__/

# Environment
.env
.env.local
.env.*.local

# Build output
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Secrets
*.key
*.pem
*.p12
credentials.json
`;

  if (stack.hasTypeScript) {
    content += `
# TypeScript
*.tsbuildinfo
`;
  }

  return {
    filename: ".gitignore",
    content,
    description: "Comprehensive .gitignore covering common patterns",
    category: "config",
  };
}

function generatePRTemplate(): GeneratedFile {
  const content = `## Description

Brief description of the changes.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?

Describe the tests you ran to verify your changes.

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
`;

  return {
    filename: ".github/pull_request_template.md",
    content,
    description: "Pull request template for consistent PR descriptions",
    category: "docs",
  };
}

function generateBugTemplate(): GeneratedFile {
  const content = `---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the Bug

A clear and concise description of what the bug is.

## To Reproduce

Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

A clear description of what you expected to happen.

## Screenshots

If applicable, add screenshots to help explain your problem.

## Environment

- OS: [e.g. Windows 11, macOS 14]
- Node.js version: [e.g. 20.x]
- Browser: [e.g. Chrome 120]

## Additional Context

Add any other context about the problem here.
`;

  return {
    filename: ".github/ISSUE_TEMPLATE/bug_report.md",
    content,
    description: "Bug report issue template",
    category: "docs",
  };
}

function generateFeatureTemplate(): GeneratedFile {
  const content = `---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Is your feature request related to a problem?

A clear description of what the problem is. Ex. I'm always frustrated when [...]

## Describe the Solution You'd Like

A clear description of what you want to happen.

## Describe Alternatives You've Considered

A description of any alternative solutions or features you've considered.

## Additional Context

Add any other context or screenshots about the feature request here.
`;

  return {
    filename: ".github/ISSUE_TEMPLATE/feature_request.md",
    content,
    description: "Feature request issue template",
    category: "docs",
  };
}

export function detectStack(packageJson: string | null, languages: string[]): StackInfo {
  const stack: StackInfo = {
    languages,
    hasPackageJson: !!packageJson,
    hasTypeScript: false,
    packageManager: "npm",
  };

  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      stack.hasTypeScript = "typescript" in allDeps;

      // Detect framework
      if ("next" in allDeps) stack.framework = "Next.js";
      else if ("react" in allDeps) stack.framework = "React";
      else if ("vue" in allDeps) stack.framework = "Vue";
      else if ("express" in allDeps) stack.framework = "Express";
      else if ("fastify" in allDeps) stack.framework = "Fastify";

      // Detect test framework
      if ("jest" in allDeps) stack.testFramework = "jest";
      else if ("vitest" in allDeps) stack.testFramework = "vitest";
      else if ("mocha" in allDeps) stack.testFramework = "mocha";

      // Detect package manager
      if (pkg.packageManager) {
        if (pkg.packageManager.startsWith("yarn")) stack.packageManager = "yarn";
        else if (pkg.packageManager.startsWith("pnpm")) stack.packageManager = "pnpm";
      }
    } catch {
      // Invalid JSON
    }
  }

  return stack;
}
