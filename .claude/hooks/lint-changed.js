// PostToolUse hook: auto-fix eslint issues on files just edited under web/src or web/e2e.
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const raw = process.env.CLAUDE_FILE_PATHS || "";
const files = raw
  .split(/\s+/)
  .filter(Boolean)
  .filter((f) => /\.(ts|tsx)$/.test(f))
  .filter((f) => /[\\/]web[\\/](src|e2e)[\\/]/.test(f));

if (files.length === 0) {
  process.exit(0);
}

const webDir = path.join(__dirname, "..", "..", "web");

try {
  execFileSync("npx", ["eslint", "--fix", ...files], {
    cwd: webDir,
    stdio: "inherit",
    shell: true,
  });
} catch {
  // eslint exits non-zero on remaining lint errors; surface them but don't crash the hook chain.
  process.exit(0);
}
