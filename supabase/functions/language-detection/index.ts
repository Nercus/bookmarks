// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import langDetect from "npm:@vscode/vscode-languagedetection";

// Load model once (important for performance)
const model = new langDetect.ModelOperations();


function isJavaScript(code: string): boolean {
  return (
    // function declarations
    /function\s+\w+\s*\(/.test(code) ||

    // arrow functions
    /=>/.test(code) ||

    // common JS keywords
    /\b(return|console|document|window)\b/.test(code) ||

    // variable assignments
    /\b(var|let|const)\b/.test(code) ||

    // object/JS syntax hints
    /\{\s*\w+:\s*/.test(code)
  );
}

function isHTML(code: string): boolean {
  const trimmed = code.trim().toLowerCase();

  return (
    // 1. Doctype (strongest signal)
    trimmed.startsWith("<!doctype html") ||

    // 2. Common root HTML tags
    trimmed.startsWith("<html") ||
    trimmed.includes("<html") && trimmed.includes("</html>") ||

    // 3. Body / head presence
    (trimmed.includes("<body") && trimmed.includes("</body>")) ||
    (trimmed.includes("<head") && trimmed.includes("</head>")) ||

    // 4. Multiple HTML tags pattern
    (/<\w+[^>]*>/.test(code) && /<\/\w+>/.test(code))
  );
}

function heuristicDetect(code: string): string | null {
  const firstLine = code.split("\n")[0].trim();

  // 1. Shebang
  if (firstLine.startsWith("#!")) {
    if (firstLine.includes("python")) return "py";
    if (firstLine.includes("node")) return "js";
    if (firstLine.includes("bash")) return "bash";
  }

  // 2. Python (prioritize before JS)
  if (
    /^def\s+\w+.*:/m.test(code) ||
    code.includes("self.") ||
    code.includes("__init__")
  ) {
    return "py";
  }

  // 3. JSON (common misclassification)
  if (code.trim().startsWith("{") && code.includes(":")) {
    return "json";
  }

  // 4. SQL
  if (/SELECT\s+.*FROM/i.test(code)) {
    return "sql";
  }

  // 5. JavaScript / TypeScript
  if (isJavaScript(code)) {
    return "js";
  }

  // 6. HTML
  if (isHTML(code)) {
    return "html"
  }

  return null;
}

async function detectLanguage(code: string) {
  // Step 1: Heuristic (fast path)
  const heuristic = heuristicDetect(code);
  if (heuristic) {
    return {
      lang: heuristic,
      source: "heuristic",
    };
  }

  // Step 2: ML fallback
  try {
    const result = await model.runModel(code);

    const best = result?.languages?.[0];

    if (!best || best.confidence < 0.5) {
      return {
        lang: "",
        source: "ml-low-confidence",
      };
    }

    return {
      lang: best.languageId,
      source: "ml",
      confidence: best.confidence,
    };
  } catch (err) {
    console.error("ML detection failed:", err);

    return {
      lang: "",
      source: "error",
    };
  }
}

Deno.serve(async (req: Request) => {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid 'code' input" }),
        { status: 400 }
      );
    }

    const result = await detectLanguage(code);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Request error:", err);

    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400 }
    );
  }
});