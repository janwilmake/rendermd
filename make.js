const https = require("https");
const fs = require("fs");

const MARKED_URL = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
const OUTPUT_FILE = "mdashtml.js";

function fetchMarked() {
  return new Promise((resolve, reject) => {
    https
      .get(MARKED_URL, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function buildCDNScript() {
  try {
    console.log("Fetching marked.min.js...");
    const markedCode = await fetchMarked();

    const cdnScript = `/*!
 * mdashtml.js - Instant Markdown Rendering
 * Include this script to automatically render markdown content as HTML
 * Usage: Just add <script src="https://mdashtml.com/mdashtml.js"></script>
 */

// Encapsulated marked.js library
(function() {
    ${markedCode}
})();

// Auto-render markdown content
(function() {
    function renderMarkdown() {
        if (typeof marked !== 'undefined') {
            // Get the current body content as text
            const markdownText = document.body.textContent || document.body.innerText || '';
            
            // Only process if it looks like markdown (contains markdown syntax)
            try {
                // Parse and render the markdown
                const htmlContent = marked.parse(markdownText);
                document.body.innerHTML = htmlContent;
            } catch (error) {
                console.error('Markdown parsing error:', error);
            }
        
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMarkdown);
    } else {
        renderMarkdown();
    }
})();
`;

    fs.writeFileSync(OUTPUT_FILE, cdnScript);
    console.log(`CDN script created: ${OUTPUT_FILE}`);
    console.log(`Size: ${(cdnScript.length / 1024).toFixed(1)}KB`);
  } catch (error) {
    console.error("Error building CDN script:", error);
  }
}

buildCDNScript();
