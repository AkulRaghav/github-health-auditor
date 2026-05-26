/**
 * GitHub Action Generator
 * Creates a workflow that runs the health audit on every PR and comments the results.
 */

export function generateHealthCheckAction(owner: string, repo: string): string {
  return `name: Repository Health Check

on:
  pull_request:
    branches: [main, master]
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9am UTC

permissions:
  pull-requests: write
  contents: read

jobs:
  health-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run Health Audit
        id: audit
        run: |
          RESULT=$(curl -s -X POST "https://your-repohealth-url.com/api/audit" \\
            -H "Content-Type: application/json" \\
            -d '{"repoUrl": "https://github.com/${owner}/${repo}"}')
          
          SCORE=$(echo $RESULT | jq -r '.overallScore')
          GRADE=$(echo $RESULT | jq -r '.grade')
          
          echo "score=$SCORE" >> $GITHUB_OUTPUT
          echo "grade=$GRADE" >> $GITHUB_OUTPUT
          
          # Generate markdown summary
          echo "## 🏥 Repository Health Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Score:** $SCORE/100 (Grade: $GRADE)" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Category | Score |" >> $GITHUB_STEP_SUMMARY
          echo "|----------|-------|" >> $GITHUB_STEP_SUMMARY
          echo "| Commits | $(echo $RESULT | jq -r '.categories.commitFrequency.score') |" >> $GITHUB_STEP_SUMMARY
          echo "| PR Speed | $(echo $RESULT | jq -r '.categories.prMergeTime.score') |" >> $GITHUB_STEP_SUMMARY
          echo "| Issues | $(echo $RESULT | jq -r '.categories.issueResponseTime.score') |" >> $GITHUB_STEP_SUMMARY
          echo "| Dependencies | $(echo $RESULT | jq -r '.categories.dependencyFreshness.score') |" >> $GITHUB_STEP_SUMMARY
          echo "| CI/CD | $(echo $RESULT | jq -r '.categories.testCoverage.score') |" >> $GITHUB_STEP_SUMMARY
          echo "| Documentation | $(echo $RESULT | jq -r '.categories.documentation.score') |" >> $GITHUB_STEP_SUMMARY
          echo "| Security | $(echo $RESULT | jq -r '.categories.security.score') |" >> $GITHUB_STEP_SUMMARY

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const score = '\${{ steps.audit.outputs.score }}';
            const grade = '\${{ steps.audit.outputs.grade }}';
            const emoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
            
            const body = \`## 🏥 Health Check \${emoji}
            
            **Score:** \${score}/100 (Grade: \${grade})
            
            [View Full Report](https://your-repohealth-url.com/report/latest)
            \`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });

      - name: Fail if score too low
        if: steps.audit.outputs.score < 40
        run: |
          echo "❌ Health score (\${{ steps.audit.outputs.score }}) is below minimum threshold (40)"
          exit 1
`;
}
