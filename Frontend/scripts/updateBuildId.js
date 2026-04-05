const fs = require("fs");
const path = require("path");

const buildId = new Date().toISOString();
const targetPath = path.join(__dirname, "..", "src", "buildId.ts");

const fileContent = `export const BUILD_ID = "${buildId}" as const;\n`;

fs.writeFileSync(targetPath, fileContent, "utf8");
console.log(`[build-id] Generated BUILD_ID=${buildId}`);
