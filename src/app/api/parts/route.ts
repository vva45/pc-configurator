/* GET /api/parts?cat=cpu&museum=0&q=…&sort=rel&showBlocked=1&filters=…&page=0&size=48
   más el montaje serializado (&cpu=18&mbo=0…) para calcular el gate.
   Devuelve una página del catálogo con facetas y contadores. */
import { NextResponse, type NextRequest } from "next/server";
import { queryCatalog } from "@/lib/catalog-server";

export function GET(req: NextRequest) {
  return NextResponse.json(queryCatalog(req.nextUrl.searchParams));
}
