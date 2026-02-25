import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { buildLiveRiotProfileByRiotId } from "../../../../lib/riot/service";
import { RiotApiError } from "../../../../lib/riot/server";
import type {
  RiotAccountLookupErrorPayload,
  RiotAccountLookupPayload,
  TwoXkoQueue,
} from "../../../../lib/types/riot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const riotId = request.nextUrl.searchParams.get("riotId")?.trim();
  const queueParam = request.nextUrl.searchParams
    .get("queue")
    ?.trim()
    ?.toLowerCase();
  const countParam = request.nextUrl.searchParams.get("count")?.trim();

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
    const queue = isTwoXkoQueue(queueParam) ? queueParam : "ranked";
    const count = clampCount(countParam);
    const live = await buildLiveRiotProfileByRiotId({ riotId, queue, count });

    let persistedPlayer: RiotAccountLookupPayload["persistedPlayer"] = null;

    try {
      const player = await prisma.player.upsert({
        where: { puuid: live.account.puuid },
        update: {
          riotId: live.account.gameName,
          tagline: live.account.tagLine,
          currentRank: live.ranked ? `${live.ranked.tier} ${live.ranked.rank}` : undefined,
          rankPoints: live.ranked?.leaguePoints ?? undefined,
        },
        create: {
          riotId: live.account.gameName,
          tagline: live.account.tagLine,
          puuid: live.account.puuid,
          currentRank: live.ranked ? `${live.ranked.tier} ${live.ranked.rank}` : null,
          rankPoints: live.ranked?.leaguePoints ?? null,
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
      account: live.account,
      persistedPlayer,
      ranked: live.ranked,
      analytics: live.analytics,
      championCatalog: live.championCatalog,
      limitations: live.limitations,
      warnings: live.warnings,
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

function isTwoXkoQueue(value: string | undefined): value is TwoXkoQueue {
  return value === "ranked" || value === "casual" || value === "tournament";
}

function clampCount(value: string | undefined) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return 20;
  }
  return Math.min(Math.max(parsed, 1), 100);
}
