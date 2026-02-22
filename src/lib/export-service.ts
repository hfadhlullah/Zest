import archiver from "archiver";
import { PassThrough } from "stream";
import { injectMeta, addWatermark, stripWatermark } from "@/lib/html-processor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationData {
  id: string;
  html: string;
  css: string | null;
  output_format: "html_css" | "tailwind";
}

export interface BuildZipOptions {
  generation: GenerationData;
  /** Override format — defaults to generation.output_format */
  format?: "html_css" | "tailwind";
  isAuthenticated: boolean;
}

// ---------------------------------------------------------------------------
// buildZip
// ---------------------------------------------------------------------------

/**
 * Build an in-memory ZIP archive for the given generation.
 *
 * html_css format  → index.html + styles.css
 * tailwind format  → index.html only (CSS inline via Tailwind classes)
 *
 * BR-012: meta tags are injected.
 * BR-013: output is not minified.
 */
export async function buildZip(options: BuildZipOptions): Promise<Buffer> {
  const { generation, format: overrideFormat, isAuthenticated } = options;
  const format = overrideFormat ?? generation.output_format;

  let html = injectMeta(generation.html);

  // Watermark anonymous exports, strip for authenticated
  if (isAuthenticated) {
    html = stripWatermark(html);
  } else {
    html = addWatermark(html);
  }

  return new Promise<Buffer>((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 6 } });
    const chunks: Buffer[] = [];
    const pass = new PassThrough();

    pass.on("data", (chunk: Buffer) => chunks.push(chunk));
    pass.on("end", () => resolve(Buffer.concat(chunks)));
    pass.on("error", reject);
    archive.on("error", reject);

    archive.pipe(pass);

    if (format === "html_css") {
      // Separate HTML and CSS files.
      // If the generation HTML embeds <style> blocks, we strip them out and
      // place their content in styles.css with a <link> pointing back.
      const { strippedHtml, extractedCss } = separateStyles(html, generation.css ?? "");

      // Link the external stylesheet
      const linkedHtml = injectStylesheetLink(strippedHtml);

      archive.append(linkedHtml, { name: "index.html" });
      archive.append(extractedCss, { name: "styles.css" });
    } else {
      // Tailwind — single file, inline classes
      archive.append(html, { name: "index.html" });
    }

    archive.finalize();
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract content from all `<style>` blocks in the HTML.
 * Returns the HTML with style blocks removed and the combined CSS text.
 * If `externalCss` is provided, it is appended to the extracted CSS.
 */
function separateStyles(
  html: string,
  externalCss: string
): { strippedHtml: string; extractedCss: string } {
  const cssChunks: string[] = [];

  // Extract all <style>…</style> blocks
  const strippedHtml = html.replace(
    /<style[^>]*>([\s\S]*?)<\/style>/gi,
    (_match, cssContent: string) => {
      cssChunks.push(cssContent.trim());
      return "";
    }
  );

  if (externalCss.trim()) {
    cssChunks.push(externalCss.trim());
  }

  return {
    strippedHtml: strippedHtml.trim(),
    extractedCss: cssChunks.join("\n\n"),
  };
}

/**
 * Insert `<link rel="stylesheet" href="styles.css">` inside `<head>`.
 * If no `<head>` is found, a minimal one is prepended.
 */
function injectStylesheetLink(html: string): string {
  const linkTag = '<link rel="stylesheet" href="styles.css">';

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `  ${linkTag}\n</head>`);
  }
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/(<head[^>]*>)/i, `$1\n  ${linkTag}`);
  }
  // No head at all — just prepend
  return `<head>\n  ${linkTag}\n</head>\n` + html;
}
