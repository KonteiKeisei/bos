function userMarkdownSetup(md) {
  // The md parameter stands for the markdown-it instance used throughout the site generator.
}

function userEleventySetup(eleventyConfig) {

  // ── Transform 1: Audio embeds  ![[file.mp3]]  →  <audio controls> ──────────
  eleventyConfig.addTransform("audio-embeds", function(str) {
    if (!str) return str;

    const mimeTypes = {
      mp3:  "audio/mpeg",
      ogg:  "audio/ogg",
      wav:  "audio/wav",
      m4a:  "audio/mp4",
      webm: "audio/webm",
      flac: "audio/flac",
    };

    return str.replace(
      /!\[\[([^\]]+\.(mp3|ogg|wav|m4a|webm|flac)(?:\|[^\]]*)?)\]\]/gi,
      function(match, inner) {
        const filePath = inner.split("|")[0].trim();
        const ext = filePath.split(".").pop().toLowerCase();
        const mime = mimeTypes[ext] || "audio/" + ext;
        const src = "/notes/" + filePath;
        return `<audio controls style="width:100%;margin:0.75em 0;border-radius:4px">` +
               `<source src="${src}" type="${mime}">` +
               `Your browser does not support audio playback.` +
               `</audio>`;
      }
    );
  });


  // ── Transform 2: Retro section boxes ─────────────────────────────────────────
  //
  // Wraps the content between <hr> tags in <div class="retro-box"> containers.
  // This lets CSS apply the grooved border / panel look to each section.
  //
  // Source structure (after markdown-it):
  //   <main class="content ...">
  //     <header>…</header>
  //     <p>intro</p>
  //     <hr>
  //     <h2>Section A</h2><p>…</p>
  //     <hr>
  //     <h2>Section B</h2><p>…</p>
  //   </main>
  //
  // Output structure:
  //   <main class="content ...">
  //     <header>…</header>
  //     <div class="retro-box">…intro…</div>
  //     <div class="retro-box"><h2>Section A</h2><p>…</p></div>
  //     <div class="retro-box"><h2>Section B</h2><p>…</p></div>
  //   </main>

  eleventyConfig.addTransform("retro-section-boxes", function(str, outputPath) {
    if (!str) return str;
    if (outputPath && !outputPath.endsWith(".html")) return str;

    // Only process pages that actually contain <hr> tags
    if (!/<hr\s*\/?>/i.test(str)) return str;

    // Target the markdown content area inside <main class="content ...">
    // We capture everything between </header> and the closing </main>
    return str.replace(
      /(<main[^>]+class="[^"]*\bcontent\b[^"]*"[^>]*>)([\s\S]*?)(<\/main>)/i,
      function(match, openTag, mainBody, closeTag) {

        // Separate the <header>…</header> block from the rest of the content
        const headerMatch = mainBody.match(/^([\s\S]*?<\/header>)([\s\S]*)$/i);
        if (!headerMatch) return match;

        const headerPart  = headerMatch[1];
        let   contentPart = headerMatch[2];

        // No <hr> in the content portion — nothing to box
        if (!/<hr\s*\/?>/i.test(contentPart)) return match;

        // Split on every <hr> (self-closing or not, with optional whitespace)
        const sections = contentPart.split(/<hr\s*\/?>/gi);

        // Wrap each non-empty section in a retro-box div
        const boxed = sections
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(s => `<div class="retro-box">\n${s}\n</div>`)
          .join("\n");

        return openTag + headerPart + "\n" + boxed + "\n" + closeTag;
      }
    );
  });

}

  // ── Transform 3: OS Banner ────────────────────────────────────────────────────
  //
  // Injects a centred grooved pill banner at the very top of every content page:
  //
  //   ╭──────────────────────────────────╮
  //   │    UNSLEEPING CITY BOSTON        │
  //   │        HallowayOS v1.2           │
  //   ╰──────────────────────────────────╯
  //
  // Inserted immediately after <main class="content ..."> so it appears above
  // the <header> / inline-title block on every note and index page.

  eleventyConfig.addTransform("os-banner", function(str, outputPath) {
    if (!str) return str;
    if (outputPath && !outputPath.endsWith(".html")) return str;

    const banner =
      `\n<div class="os-banner" aria-hidden="true">` +
        `<span class="os-title">Unsleeping City Boston</span>` +
        `<span class="os-subtitle">HallowayOS v1.2</span>` +
      `</div>\n`;

    // Insert right after the opening <main class="content ..."> tag
    return str.replace(
      /(<main[^>]+class="[^"]*\bcontent\b[^"]*"[^>]*>)/i,
      `$1${banner}`
    );
  });

}

exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
