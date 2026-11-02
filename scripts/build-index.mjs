// Builds index.json from themes/*.json: checks every theme the way Shard does on install, then lists it with its size and SHA-256.
//   node scripts/build-index.mjs           write index.json
//   node scripts/build-index.mjs --check   fail when index.json is not what the theme files give (used by CI)
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const REPO = "kinan9011/shard-themes";
const MAX_BYTES = 64 * 1024;
// Same rules as src-tauri/src/themes.rs in kinan9011/shard. Keep them in step.
const BUILT_IN = ["default", "adwaita", "solarized", "classic", "kate", "tango", "cobalt", "oblivion"];
const TOKENS = new Set([
  "--background", "--foreground", "--card", "--card-foreground", "--popover", "--popover-foreground",
  "--primary", "--primary-foreground", "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
  "--accent", "--accent-foreground", "--destructive", "--destructive-foreground", "--success", "--success-foreground",
  "--warning", "--warning-foreground", "--info", "--info-foreground", "--border", "--input", "--ring",
  "--sidebar-background", "--sidebar-foreground", "--sidebar-primary", "--sidebar-primary-foreground",
  "--sidebar-accent", "--sidebar-accent-foreground", "--sidebar-border", "--sidebar-ring",
  "--chrome-input-border", "--chrome-muted-foreground",
  "--surface-chrome", "--surface-editor", "--surface-raised", "--surface-sidebar",
  "--syntax-fn", "--syntax-kw", "--syntax-lit", "--syntax-num", "--syntax-str",
]);
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const TRIPLET = /^\d{1,3}(\.\d{1,2})? \d{1,3}(\.\d{1,2})?% \d{1,3}(\.\d{1,2})?%$/;
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

function problems(file, id, theme) {
  const out = [];
  if (!/^[a-z0-9-]{1,40}$/.test(theme.id ?? "")) out.push("id must be 1 to 40 characters of a-z, 0-9 and -");
  if (theme.id !== id) out.push(`the file must be named ${theme.id}.json`);
  if (BUILT_IN.includes(theme.id)) out.push(`id "${theme.id}" is a built-in scheme`);
  if (!theme.name || theme.name.length > 40) out.push("name must be 1 to 40 characters");
  if (!SEMVER.test(theme.version ?? "")) out.push("version must be a semver version");
  if (!theme.light && !theme.dark) out.push('needs a "light" or a "dark" block');
  for (const mode of ["light", "dark"]) {
    for (const [token, value] of Object.entries(theme[mode] ?? {})) {
      if (!TOKENS.has(token)) out.push(`${mode}: unknown token ${token}`);
      else if (!(/^--(surface|syntax)-/.test(token) ? HEX : TRIPLET).test(value)) out.push(`${mode}: bad value for ${token}: ${value}`);
    }
  }
  return out.map((line) => `${file}: ${line}`);
}

const files = readdirSync("themes").filter((name) => name.endsWith(".json")).sort();
const errors = [];
const themes = files.map((file) => {
  const bytes = readFileSync(`themes/${file}`);
  const id = file.slice(0, -".json".length);
  let theme = {};
  try {
    theme = JSON.parse(bytes);
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
  }
  if (bytes.length > MAX_BYTES) errors.push(`${file}: larger than 64 KB`);
  errors.push(...problems(file, id, theme));
  return {
    id,
    name: theme.name,
    version: theme.version,
    description: theme.description ?? "",
    url: `https://raw.githubusercontent.com/${REPO}/main/themes/${file}`,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    size: bytes.length,
  };
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const index = JSON.stringify({ schema: 1, name: "Shard Themes", plugins: [], themes }, null, 2) + "\n";
if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync("index.json", "utf8");
  } catch {}
  if (current !== index) {
    console.error("index.json is out of date. Run: node scripts/build-index.mjs");
    process.exit(1);
  }
  console.log(`index.json is up to date (${themes.length} themes)`);
} else {
  writeFileSync("index.json", index);
  console.log(`index.json: ${themes.length} themes`);
}
