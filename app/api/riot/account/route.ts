import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { RiotApiError, fetch2XkoChampionCatalogSummary, fetchRiotAccountByRiotId } from "../../../../lib/riot/server";
import type { RiotAccountLookupErrorPayload, RiotAccountLookupPayload } from "../../../../lib/types/riot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const riotId = request.nextUrl.searchParams.get("riotId")?.trim();

  if (!riotId) {
    return NextResponse.json<RiotAccountLookupErrorPayload>(
      {
        ok: false,
        code: "INVALID_RIOT_ID",
        status: 400,
        error: "Paramètre `riotId` requis (`Pseudo#TAG`).",
      },
      { status: 400 },
    );
  }

  try {
    const [account, championCatalog] = await Promise.all([
      fetchRiotAccountByRiotId(riotId),
      fetch2XkoChampionCatalogSummary(),
    ]);

    let persistedPlayer: RiotAccountLookupPayload["persistedPlayer"] = null;

    try {
      const player = await prisma.player.upsert({
        where: { puuid: account.puuid },
        update: {
          riotId: account.gameName,
          tagline: account.tagLine,
        },
        create: {
          riotId: account.gameName,
          tagline: account.tagLine,
          puuid: account.puuid,
          currentRank: null,
        },
      });

      persistedPlayer = {
        id: player.id,
        riotId: player.riotId,
        tagline: player.tagline,
        puuid: player.puuid,
      };
    } catch (dbError) {
      console.error("Prisma upsert failed for Riot account lookup", dbError);
    }

    return NextResponse.json<RiotAccountLookupPayload>({
      ok: true,
      account,
      persistedPlayer,
      championCatalog,
      limitations: {
        hasPublic2XkoMatchApiInCatalog: false,
        requiresRsoPlayerOptIn: true,
        note:
          "Le portail Riot 2XKO documente le produit et mentionne RSO/opt-in, mais aucun endpoint match 2XKO public n’est visible dans le catalogue API public au moment de cette intégration.",
      },
    });
  } catch (error) {
    if (error instanceof RiotApiError) {
      return NextResponse.json<RiotAccountLookupErrorPayload>(
        {
          ok: false,
          code: error.code,
          status: error.status,
          error: error.message,
          details: error.details,
        },
        { status: error.status },
      );
    }

    console.error("Unhandled Riot account API route error", error);

    return NextResponse.json<RiotAccountLookupErrorPayload>(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        status: 500,
        error: "Erreur interne lors du lookup Riot.",
      },
      { status: 500 },
    );
  }
}
