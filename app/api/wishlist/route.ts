import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/session";
import { getWishlistIds } from "@/lib/account";

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ saved: false }, { status: 401 });
  const ids = await getWishlistIds(session.userId);
  const productId = req.nextUrl.searchParams.get("productId");
  if (productId) return NextResponse.json({ saved: ids.includes(productId) });
  return NextResponse.json({ ids });
}
