import type { SupabaseDbClient } from "@/lib/supabase";

/**
 * Returns an SSE-format ReadableStream that emits the cached content as a
 * single OpenRouter-style data chunk followed by [DONE].
 */
export function cachedContentStream(content: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const chunk = JSON.stringify({ choices: [{ delta: { content } }] });
      controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });
}

/**
 * Wraps an upstream SSE ReadableStream with a TransformStream that:
 * 1. Passes all bytes through unchanged (client gets the stream as-is)
 * 2. Accumulates the text content from SSE chunks
 * 3. On flush, saves the accumulated content to section_card_cache
 */
export function withCaching(
  upstream: ReadableStream<Uint8Array>,
  cacheKey: string,
  supabase: SupabaseDbClient
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let accumulated = "";

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(chunk);

      const text = decoder.decode(chunk, { stream: true });
      for (const line of text.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (typeof delta === "string") accumulated += delta;
        } catch {
          // ignore malformed chunks
        }
      }
    },

    async flush() {
      if (accumulated.trim().length === 0) return;
      try {
        await supabase.from("section_card_cache").upsert(
          { cache_key: cacheKey, content: accumulated },
          { onConflict: "cache_key" }
        );
      } catch {
        // Non-fatal — cache miss just means next request regenerates
      }
    },
  });

  return upstream.pipeThrough(transform);
}
