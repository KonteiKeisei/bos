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

    if (!/<hr\s*\/?>/i.test(str)) return str;

    return str.replace(
      /(<main[^>]+class="[^"]*\bcontent\b[^"]*"[^>]*>)([\s\S]*?)(<\/main>)/i,
      function(match, openTag, mainBody, closeTag) {
        const headerMatch = mainBody.match(/^([\s\S]*?<\/header>)([\s\S]*)$/i);
        if (!headerMatch) return match;

        const headerPart  = headerMatch[1];
        const contentPart = headerMatch[2];

        if (!/<hr\s*\/?>/i.test(contentPart)) return match;

        const sections = contentPart.split(/<hr\s*\/?>/gi);
        const boxed = sections
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(s => `<div class="retro-box">\n${s}\n</div>`)
          .join("\n");

        return openTag + headerPart + "\n" + boxed + "\n" + closeTag;
      }
    );
  });


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

    return str.replace(
      /(<main[^>]+class="[^"]*\bcontent\b[^"]*"[^>]*>)/i,
      `$1${banner}`
    );
  });



  // ── Transform 4: Image glitch wrapper ────────────────────────────────────────
  //
  // Wraps every <img> inside the main content area in a .glitch-wrap div,
  // passing the image src as a CSS variable (--gi) so the pseudo-element
  // overlays can reference the same image for the glitch effect.
  // A small random per-image delay (--gd) staggers the animations.
  //
  //   Before:  <img src="/notes/map.jpg" alt="map">
  //   After:   <div class="glitch-wrap" style="--gi:url('/notes/map.jpg');--gd:2.34s">
  //              <img src="/notes/map.jpg" alt="map">
  //            </div>

  eleventyConfig.addTransform("image-glitch-wrap", function(str, outputPath) {
    if (!str) return str;
    if (outputPath && !outputPath.endsWith(".html")) return str;

    return str.replace(
      /(<main[^>]+class="[^"]*\bcontent\b[^"]*"[^>]*>)([\s\S]*?)(<\/main>)/i,
      function(match, openTag, body, closeTag) {
        const wrappedBody = body.replace(
          /(<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*?\/?>)/gi,
          function(imgMatch, imgTag, src) {
            // Skip data URIs
            if (src.startsWith("data:")) return imgMatch;
            const delay = (Math.random() * 6).toFixed(2);
            return `<div class="glitch-wrap" style="--gi:url('${src}');--gd:${delay}s">${imgTag}</div>`;
          }
        );
        return openTag + wrappedBody + closeTag;
      }
    );
  });



  // ── Transform 5: Typewriter heading animation ─────────────────────────────
  //
  // Injects a small inline <script> before </body> on every HTML page.
  // On DOMContentLoaded it finds all h2/h3 inside main.content and:
  //   1. Sets overflow:hidden + white-space:nowrap so width-clip works
  //   2. Applies a `typewriter` animation with steps() equal to char count
  //   3. Staggers each heading after the previous finishes (~55ms/char + 250ms gap)
  //   4. Blinking border-right cursor tracks the growing text edge
  //   5. Removes cursor + restores normal styles once typing completes

  eleventyConfig.addTransform("typewriter-headings", function(str, outputPath) {
    if (!str) return str;
    if (outputPath && !outputPath.endsWith(".html")) return str;
    if (!/<main[^>]+class="[^"]*\bcontent\b/i.test(str)) return str;

    const script = `
<script>
(function () {
  function initTypewriter() {
    var headings = Array.from(
      document.querySelectorAll('main.content h2, main.content h3')
    );
    var cumDelay = 0.25;

    headings.forEach(function (h) {
      var len = (h.textContent || '').trim().length || 1;
      var dur = Math.max(0.35, len * 0.055);

      h.style.overflow    = 'hidden';
      h.style.whiteSpace  = 'nowrap';
      h.style.borderRight = '2px solid oklch(73% 0.14 192)';
      h.style.animation   = [
        'typewriter '      + dur   + 's steps(' + len + ', end) ' + cumDelay + 's 1 both',
        'blinkTextCursor 0.55s step-end ' + cumDelay + 's infinite',
        'crt-text-flicker 0.02s infinite alternate'
      ].join(', ');

      // Clean up cursor once this heading finishes typing
      (function (d, du) {
        setTimeout(function () {
          h.style.borderRight = 'none';
          h.style.overflow    = '';
          h.style.whiteSpace  = '';
          h.style.animation   = 'crt-text-flicker 0.02s infinite alternate';
        }, (d + du + 0.15) * 1000);
      })(cumDelay, dur);

      cumDelay += dur + 0.25;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriter);
  } else {
    initTypewriter();
  }
})();
<\/script>`;

    return str.replace('</body>', script + '\n</body>');
  });

}

exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
