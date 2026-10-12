const { execFileSync } = require("node:child_process");
const { rmSync } = require("node:fs");
const { resolve } = require("node:path");

module.exports = async function buildTestArtifacts() {
  const rootDir = resolve(__dirname, "..");
  rmSync(resolve(rootDir, "dist"), { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [resolve(rootDir, "node_modules/typescript/bin/tsc"), "-p", resolve(rootDir, "tsconfig.json")],
    { cwd: rootDir, stdio: "inherit" }
  );
};
