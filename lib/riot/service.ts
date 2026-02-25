import "server-only";

import type { RiotAccountLookupPayload, TwoXkoMatchDto, TwoXkoQueue, TwoXkoRankedStatsDto } from "../types/riot";
import {
  RiotApiError,
  fetch2XkoChampionCatalogSummary,
  fetch2XkoMatchById,
  fetch2XkoMatchIdsByPuuid,
  fetch2XkoRankedStatsByPuuid,
  fetchRiotAccountByRiotId,
} from "./server";

type TrackedMatch = {
  matchId: string;
  result: "WIN" | "LOSS";
  duo: [string, string];
  anchorChar: string | null;
  pointChar: string | null;
  gameMode: string | null;
  durationSeconds: number | null;
  firstHits: number;
  comboPeak: number;
  assistsCalled: number;
  damageDealt: number;
  tagsPerformed: number;
  roundsPlayed: number | null;
};

type LiveRiotProfileData = Pick<
  RiotAccountLookupPayload,
  "account" | "ranked" | "analytics" | "championCatalog" | "limitations" | "warnings"
>;

export async function buildLiveRiotProfileByRiotId(params: {
  riotId: string;
  count?: number;
  queue?: TwoXkoQueue;
}): Promise<LiveRiotProfileData> {
  const { riotId, count = 20, queue = "ranked" } = params;
  const warnings: string[] = [];

  const [account, championCatalog] = await Promise.all([
    fetchRiotAccountByRiotId(riotId),
    fetch2XkoChampionCatalogSummary(),
  ]);

  const [rankedResult, matchIdsResult] = await Promise.allSettled([
    fetch2XkoRankedStatsByPuuid({
      puuid: account.puuid,
      cluster: account.sourceCluster,
    }),
    fetch2XkoMatchIdsByPuuid({
      puuid: account.puuid,
      cluster: account.sourceCluster,
      count,
      queue,
    }),
  ]);

  let ranked: TwoXkoRankedStatsDto | null = null;
  if (rankedResult.status === "fulfilled") {
    ranked = rankedResult.value;
  } else {
    warnings.push(formatPartialError("ranked-v1", rankedResult.reason));
  }

  let analytics: RiotAccountLookupPayload["analytics"] = null;
  if (matchIdsResult.status === "fulfilled") {
    const matchIds = Array.isArray(matchIdsResult.value) ? matchIdsResult.value : [];
    const trackedMatches = await fetchAndTrackMatches({
      matchIds,
      puuid: account.puuid,
      cluster: account.sourceCluster,
      warnings,
    });

    analytics = computeAnalytics({
      matches: trackedMatches,
      queue,
    });
  } else {
    warnings.push(formatPartialError("match-v1 ids", matchIdsResult.reason));
  }

  return {
    account,
    ranked,
    analytics,
    championCatalog,
    limitations: {
      hasPublic2XkoMatchApiInCatalog: analytics !== null,
      requiresRsoPlayerOptIn: true,
      note:
        analytics !== null
          ? "Endpoints 2XKO-MATCH-V1 / 2XKO-RANKED-V1 consommés selon la spec fournie. Vérifie les champs exacts si Riot change la réponse."
          : "Match/ranked 2XKO indisponibles avec la configuration actuelle (route, clé ou accès). Le lookup Riot ID reste opérationnel.",
    },
    warnings,
  };
}

async function fetchAndTrackMatches(params: {
  matchIds: string[];
  puuid: string;
  cluster: RiotAccountLookupPayload["account"]["sourceCluster"];
  warnings: string[];
}) {
  const { matchIds, puuid, cluster, warnings } = params;
  const limitedIds = matchIds.slice(0, 20);

  const results = await mapWithConcurrency(limitedIds, 4, async (matchId) => {
    const dto = await fetch2XkoMatchById({ matchId, cluster });
    return extractTrackedMatch(dto, puuid, matchId);
  });

  const tracked: TrackedMatch[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      tracked.push(result.value);
      continue;
    }

    if (result.status === "rejected") {
      warnings.push(formatPartialError("match-v1 detail", result.reason));
    }
  }

  return tracked;
}

function extractTrackedMatch(
  dto: TwoXkoMatchDto,
  puuid: string,
  fallbackMatchId: string,
): TrackedMatch | null {
  const matchId = dto.metadata?.match_id ?? fallbackMatchId;
  const teams = dto.info?.teams ?? [];

  for (const team of teams) {
    for (const player of team.players ?? []) {
      if (player.puuid !== puuid) {
        continue;
      }

      const characters = (player.characters ?? []).filter((c) => typeof c.char_id === "string");
      const names = characters.map((c) => c.char_id as string);
      const anchor =
        characters.find((c) => c.is_anchor)?.char_id ??
        (names.length > 1 ? names[1] : names[0] ?? null);
      const pointChar =
        characters.find((c) => c.is_anchor === false)?.char_id ??
        (names.find((name) => name !== anchor) ?? names[0] ?? null);

      const duo = normalizeDuo(names[0] ?? null, names[1] ?? null, anchor);
      const stats = player.stats ?? {};
      const roundsPlayed = numberOrNull(stats.rounds_played ?? stats.rounds);

      return {
        matchId,
        result: team.won ? "WIN" : "LOSS",
        duo,
        anchorChar: typeof anchor === "string" ? anchor : null,
        pointChar: typeof pointChar === "string" ? pointChar : null,
        gameMode: typeof dto.info?.game_mode === "string" ? dto.info?.game_mode : null,
        durationSeconds: numberOrNull(dto.info?.game_duration),
        firstHits: numberOrZero(stats.first_hits),
        comboPeak: numberOrZero(stats.combo_peak),
        assistsCalled: numberOrZero(stats.assists_called),
        damageDealt: numberOrZero(stats.damage_dealt),
        tagsPerformed: numberOrZero(stats.tags_performed),
        roundsPlayed,
      };
    }
  }

  return null;
}

function computeAnalytics(params: {
  matches: TrackedMatch[];
  queue: TwoXkoQueue;
}): RiotAccountLookupPayload["analytics"] {
  const { matches, queue } = params;

  const wins = matches.filter((m) => m.result === "WIN").length;
  const losses = matches.length - wins;

  const duoMap = new Map<
    string,
    {
      duo: [string, string];
      wins: number;
      losses: number;
      totalMatches: number;
    }
  >();

  const anchorMap = new Map<
    string,
    {
      wins: number;
      losses: number;
      totalMatches: number;
    }
  >();

  let totalFirstHits = 0;
  let totalRoundsSeen = 0;
  let roundsKnownCount = 0;

  for (const match of matches) {
    const duoKey = match.duo.join("|");
    const duoEntry = duoMap.get(duoKey) ?? {
      duo: match.duo,
      wins: 0,
      losses: 0,
      totalMatches: 0,
    };

    duoEntry.totalMatches += 1;
    if (match.result === "WIN") {
      duoEntry.wins += 1;
    } else {
      duoEntry.losses += 1;
    }
    duoMap.set(duoKey, duoEntry);

    if (match.anchorChar) {
      const anchorEntry = anchorMap.get(match.anchorChar) ?? {
        wins: 0,
        losses: 0,
        totalMatches: 0,
      };
      anchorEntry.totalMatches += 1;
      if (match.result === "WIN") {
        anchorEntry.wins += 1;
      } else {
        anchorEntry.losses += 1;
      }
      anchorMap.set(match.anchorChar, anchorEntry);
    }

    totalFirstHits += match.firstHits;
    if (match.roundsPlayed !== null && match.roundsPlayed > 0) {
      totalRoundsSeen += match.roundsPlayed;
      roundsKnownCount += 1;
    }
  }

  const duoStats = [...duoMap.values()]
    .map((entry) => ({
      ...entry,
      winrate: entry.totalMatches > 0 ? roundPct(entry.wins / entry.totalMatches) : 0,
    }))
    .sort((a, b) => b.totalMatches - a.totalMatches || b.winrate - a.winrate)
    .slice(0, 8);

  const anchorStats = [...anchorMap.entries()]
    .map(([charId, entry]) => ({
      charId,
      ...entry,
      winrate: entry.totalMatches > 0 ? roundPct(entry.wins / entry.totalMatches) : 0,
    }))
    .sort((a, b) => b.totalMatches - a.totalMatches || b.winrate - a.winrate)
    .slice(0, 8);

  const topAnchor = anchorStats[0];
  const ratioFirstHitsPerRound =
    totalRoundsSeen > 0 ? Number((totalFirstHits / totalRoundsSeen).toFixed(3)) : null;
  const averageFirstHitsPerMatch =
    matches.length > 0 ? Number((totalFirstHits / matches.length).toFixed(2)) : 0;

  const aggressivityBadge =
    ratioFirstHitsPerRound === null
      ? "Indetermine"
      : ratioFirstHitsPerRound > 0.7
        ? "Predateur"
        : "Standard";

  return {
    sampleWindowMatches: matches.length,
    queue,
    wins,
    losses,
    duoStats,
    anchor: {
      topAnchorChar: topAnchor?.charId ?? null,
      topAnchorWinrate: topAnchor?.winrate ?? null,
      byAnchorChar: anchorStats,
    },
    aggressivity: {
      badge: aggressivityBadge,
      ratioFirstHitsPerRound,
      averageFirstHitsPerMatch,
      totalFirstHits,
      totalRoundsSeen: roundsKnownCount > 0 ? totalRoundsSeen : null,
    },
    recentMatches: matches.slice(0, 10).map((match) => ({
      matchId: match.matchId,
      result: match.result,
      duo: match.duo,
      anchorChar: match.anchorChar,
      gameMode: match.gameMode,
      durationSeconds: match.durationSeconds,
      firstHits: match.firstHits,
      comboPeak: match.comboPeak,
    })),
  };
}

function normalizeDuo(
  first: string | null,
  second: string | null,
  anchorFallback: string | null,
): [string, string] {
  const raw = [first, second].filter((value): value is string => Boolean(value));

  if (raw.length === 0) {
    return [anchorFallback ?? "Unknown", "Unknown"];
  }

  if (raw.length === 1) {
    return [raw[0], anchorFallback && anchorFallback !== raw[0] ? anchorFallback : raw[0]];
  }

  const sorted = [...raw].sort((a, b) => a.localeCompare(b));
  return [sorted[0], sorted[1]];
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function roundPct(ratio: number) {
  return Math.round(ratio * 100);
}

function formatPartialError(scope: string, error: unknown) {
  if (error instanceof RiotApiError) {
    return `${scope}: ${error.message}${error.status ? ` (${error.status})` : ""}`;
  }
  if (error instanceof Error) {
    return `${scope}: ${error.message}`;
  }
  return `${scope}: erreur inconnue`;
}

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  worker: (item: TInput, index: number) => Promise<TOutput>,
) {
  const results: Array<PromiseSettledResult<TOutput>> = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        const value = await worker(items[index], index);
        results[index] = { status: "fulfilled", value };
      } catch (error) {
        results[index] = { status: "rejected", reason: error };
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, () =>
    runWorker(),
  );

  await Promise.all(workers);
  return results;
}
