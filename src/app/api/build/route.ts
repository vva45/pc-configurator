/* GET /api/build?cpu=18&mbo=0&ram=1x2…
   Resuelve un montaje serializado en la URL a piezas completas (Picked),
   para reconstruir un enlace compartido sin mandar el catálogo al cliente. */
import { NextResponse, type NextRequest } from "next/server";
import { resolveBuild } from "@/lib/catalog-server";

export function GET(req: NextRequest) {
  return NextResponse.json(resolveBuild(req.nextUrl.searchParams));
}
