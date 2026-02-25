import "dotenv/config";
import { ingestFromGutenberg } from "../lib/gutenberg";

async function main() {
  const arg = process.argv[2];
  const gutenbergId = Number(arg);

  if (!arg || Number.isNaN(gutenbergId) || gutenbergId <= 0) {
    console.error("Usage: npm run ingest -- <gutenbergId>");
    process.exit(1);
  }

  console.log(`Ingesting Gutenberg work ${gutenbergId}...`);
  const summary = await ingestFromGutenberg(gutenbergId);
  console.log("Ingestion complete:");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
