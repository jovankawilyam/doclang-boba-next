import { NextRequest, NextResponse } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const { GET, POST: rawPOST } = createRouteHandler({
  router: ourFileRouter,
});

export { GET };

export async function POST(request: NextRequest) {
  const limit = consumeRateLimit(getRateLimitKey("uploadthing", request), {
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Terlalu banyak unggahan. Coba lagi nanti." },
      { status: 429 },
    );
  }
  return rawPOST(request);
}
