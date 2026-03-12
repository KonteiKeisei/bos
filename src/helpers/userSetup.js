function userMarkdownSetup(md) {
  // The md parameter stands for the markdown-it instance used throughout the site generator.
}

function userEleventySetup(eleventyConfig) {
  // Convert Obsidian audio embeds  ![[file.mp3]]  →  <audio controls> player
  eleventyConfig.addTransform("audio-embeds", function(str) {
    if (!str) return str;

    const audioExts = /\.(mp3|ogg|wav|m4a|webm|flac)$/i;
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
        // Strip optional pipe-alias  e.g. "Music/track.mp3|My Song"
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
}

exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
