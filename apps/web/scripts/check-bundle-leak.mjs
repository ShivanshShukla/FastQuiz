/* global console, process */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

const FORBIDDEN_PATTERNS = [
  { name: "Named Testimonial: Vikram S.", pattern: /Vikram\s+S\./i },
  { name: "Named Testimonial: Ananya M.", pattern: /Ananya\s+M\./i },
  { name: "Named Testimonial: Karthik R.", pattern: /Karthik\s+R\./i },
  { name: "Placeholder Seed: att-seed-1", pattern: /att-seed-1/i },
  { name: "Placeholder Seed: quiz-seed-1", pattern: /quiz-seed-1/i },
  { name: "Fake Marketing Claim: 92% FAANG", pattern: /92%\s+FAANG/i },
  {
    name: "Fake Marketing Claim: 10,000+ benchmarked",
    pattern: /10,000\+\s+(Engineers|Candidates|benchmarked)/i,
  },
];

if (!fs.existsSync(distDir)) {
  console.error(
    `[check-bundle-leak] Error: dist directory not found at ${distDir}. Run 'npm run build' first.`,
  );
  process.exit(1);
}

function getFiles(dir) {
  const subdirs = fs.readdirSync(dir);
  const files = subdirs.map((subdir) => {
    const res = path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? getFiles(res) : res;
  });
  return files.reduce((a, f) => a.concat(f), []);
}

const allFiles = getFiles(distDir).filter(
  (f) => f.endsWith(".js") || f.endsWith(".html") || f.endsWith(".css"),
);
let leaksFound = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(distDir, file);

  for (const { name, pattern } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      console.error(
        `\x1b[31m[LEAK DETECTED]\x1b[0m ${name} found in dist/${relPath}`,
      );
      leaksFound++;
    }
  }
}

if (leaksFound > 0) {
  console.error(
    `\x1b[31m[FAILED]\x1b[0m ${leaksFound} mock data / fake claim leak(s) detected in production bundle.`,
  );
  process.exit(1);
} else {
  console.log(
    `\x1b[32m[PASSED]\x1b[0m 0 mock data leaks detected across ${allFiles.length} bundle files.`,
  );
  process.exit(0);
}
