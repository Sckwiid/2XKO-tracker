import "server-only";

import type {
  RiotAccountCluster,
  RiotAccountDto,
  TwoXkoMatchDto,
  TwoXkoMatchIdsResponse,
  TwoXkoQueue,
  TwoXkoRankedStatsDto,
} from "../types/riot";

const RIOT_ACCOUNT_CLUSTERS: RiotAccountCluster[] = ["europe", "americas", "asia"];
const TWO_XKO_CHAMPIONS_URL = "https://map.rgpub.io/public/2xko/latest/champions.json";

type ParsedRiotId = {
  gameName: string;
  tagLine: string;
};

export class RiotApiError extends Error {
  code:
    | "MISSING_RIOT_API_KEY"
    | "INVALID_RIOT_ID"
    | "ACCOUNT_NOT_FOUND"
    | "RIOT_UNAUTHORIZED"
    | "RIOT_FORBIDDEN"
    | "RIOT_RATE_LIMIT"
    | "RIOT_UPSTREAM_ERROR";
  status: number;
  details?: string;

  constructor(
    code: RiotApiError["code"],
    status: number,
    message: string,
    details?: string,
  ) {
    super(message);
    this.name = "RiotApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function parseRiotId(input: string): ParsedRiotId {
  const value = input.trim();
  const hashIndex = value.lastIndexOf("#");

  if (hashIndex <= 0 || hashIndex === value.length - 1) {
    throw new RiotApiError(
      "INVALID_RIOT_ID",
      400,
      "Format Riot ID invalide. Utilise `Pseudo#TAG`.",
    );
  }

  const gameName = value.slice(0, hashIndex).trim();
  const tagLine = value.slice(hashIndex + 1).trim();

  if (!gameName || !tagLine) {
    throw new RiotApiError(
      "INVALID_RIOT_ID",
      400,
      "Format Riot ID invalide. Utilise `Pseudo#TAG`.",
    );
  }

  return { gameName, tagLine };
}

export async function fetchRiotAccountByRiotId(riotId: string) {
  const apiKey = process.env.RIOT_API_KEY?.trim();

  if (!apiKey) {
    throw new RiotApiError(
      "MISSING_RIOT_API_KEY",
      500,
      "Variable `RIOT_API_KEY` absente sur le serveur.",
    );
  }

  const { gameName, tagLine } = parseRiotId(riotId);
  let last404 = false;

  for (const cluster of RIOT_ACCOUNT_CLUSTERS) {
    const endpoint = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName,
    )}/${encodeURIComponent(tagLine)}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-Riot-Token": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as RiotAccountDto;

      return {
        puuid: data.puuid,
        gameName: data.gameName ?? gameName,
        tagLine: data.tagLine ?? tagLine,
        riotId: `${data.gameName ?? gameName}#${data.tagLine ?? tagLine}`,
        sourceCluster: cluster,
        fetchedAt: new Date().toISOString(),
      };
    }

    if (response.status === 404) {
      last404 = true;
      continue;
    }

    const details = await safeErrorBody(response);

    if (response.status === 401) {
      throw new RiotApiError(
        "RIOT_UNAUTHORIZED",
        401,
        "RIOT_API_KEY invalide ou expirée.",
        details,
      );
    }

    if (response.status === 403) {
      throw new RiotApiError(
        "RIOT_FORBIDDEN",
        403,
        "Accès refusé par Riot (clé non autorisée pour cette route / produit).",
        details,
      );
    }

    if (response.status === 429) {
      throw new RiotApiError(
        "RIOT_RATE_LIMIT",
        429,
        "Rate limit Riot atteint. Réessaie dans quelques secondes.",
        details,
      );
    }

    throw new RiotApiError(
      "RIOT_UPSTREAM_ERROR",
      response.status,
      "Erreur upstream Riot lors du lookup account.",
      details,
    );
  }

  if (last404) {
    throw new RiotApiError(
      "ACCOUNT_NOT_FOUND",
      404,
      "Compte Riot introuvable pour ce Riot ID.",
    );
  }

  throw new RiotApiError(
    "RIOT_UPSTREAM_ERROR",
    502,
    "Impossible de résoudre le compte Riot pour le moment.",
  );
}

export async function fetch2XkoMatchIdsByPuuid(params: {
  puuid: string;
  cluster: RiotAccountCluster;
  start?: number;
  count?: number;
  queue?: TwoXkoQueue;
}) {
  const { puuid, cluster, start = 0, count = 20, queue } = params;
  const safeCount = Math.min(Math.max(count, 1), 100);

  const search = new URLSearchParams({
    start: String(Math.max(start, 0)),
    count: String(safeCount),
  });

  if (queue) {
    search.set("queue", queue);
  }

  return requestRiotJson<TwoXkoMatchIdsResponse>({
    cluster,
    path: `/match/v1/matches/by-puuid/${encodeURIComponent(puuid)}/ids?${search.toString()}`,
    contextLabel: "2XKO match id list",
    notFoundCode: "ACCOUNT_NOT_FOUND",
    notFoundMessage: "Aucun match 2XKO trouvé pour ce joueur.",
  });
}

export async function fetch2XkoMatchById(params: {
  matchId: string;
  cluster: RiotAccountCluster;
}) {
  const { matchId, cluster } = params;

  return requestRiotJson<TwoXkoMatchDto>({
    cluster,
    path: `/match/v1/matches/${encodeURIComponent(matchId)}`,
    contextLabel: "2XKO match detail",
    notFoundCode: "ACCOUNT_NOT_FOUND",
    notFoundMessage: `Match 2XKO introuvable (${matchId}).`,
  });
}

export async function fetch2XkoRankedStatsByPuuid(params: {
  puuid: string;
  cluster: RiotAccountCluster;
}) {
  const { puuid, cluster } = params;

  return requestRiotJson<TwoXkoRankedStatsDto>({
    cluster,
    path: `/ranked/v1/stats/by-puuid/${encodeURIComponent(puuid)}`,
    contextLabel: "2XKO ranked stats",
    notFoundCode: "ACCOUNT_NOT_FOUND",
    notFoundMessage: "Stats ranked 2XKO introuvables pour ce joueur.",
  });
}

export async function fetch2XkoChampionCatalogSummary() {
  try {
    const response = await fetch(TWO_XKO_CHAMPIONS_URL, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    const names = extractChampionNames(payload);
    const uniqueNames = [...new Set(names)].filter(Boolean);

    return {
      sourceUrl: TWO_XKO_CHAMPIONS_URL,
      count: uniqueNames.length > 0 ? uniqueNames.length : inferCollectionCount(payload),
      sampleNames: uniqueNames.slice(0, 8),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function requestRiotJson<T>(params: {
  cluster: RiotAccountCluster;
  path: string;
  contextLabel: string;
  notFoundCode: RiotApiError["code"];
  notFoundMessage: string;
}) {
  const { cluster, path, contextLabel, notFoundCode, notFoundMessage } = params;
  const apiKey = process.env.RIOT_API_KEY?.trim();

  if (!apiKey) {
    throw new RiotApiError(
      "MISSING_RIOT_API_KEY",
      500,
      "Variable `RIOT_API_KEY` absente sur le serveur.",
    );
  }

  const baseUrl =
    process.env.RIOT_2XKO_API_BASE_URL?.trim() ||
    `https://${cluster}.api.riotgames.com`;

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      "X-Riot-Token": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.ok) {
    return (await response.json()) as T;
  }

  const details = await safeErrorBody(response);

  if (response.status === 404) {
    throw new RiotApiError(notFoundCode, 404, notFoundMessage, details);
  }

  if (response.status === 401) {
    throw new RiotApiError(
      "RIOT_UNAUTHORIZED",
      401,
      `RIOT_API_KEY invalide ou expirée (${contextLabel}).`,
      details,
    );
  }

  if (response.status === 403) {
    throw new RiotApiError(
      "RIOT_FORBIDDEN",
      403,
      `Accès refusé par Riot pour ${contextLabel} (route non autorisée / clé insuffisante).`,
      details,
    );
  }

  if (response.status === 429) {
    throw new RiotApiError(
      "RIOT_RATE_LIMIT",
      429,
      `Rate limit Riot atteint sur ${contextLabel}.`,
      details,
    );
  }

  throw new RiotApiError(
    "RIOT_UPSTREAM_ERROR",
    response.status,
    `Erreur Riot sur ${contextLabel}.`,
    details,
  );
}

async function safeErrorBody(response: Response) {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return JSON.stringify(await response.json());
    }
    return await response.text();
  } catch {
    return undefined;
  }
}

function inferCollectionCount(payload: unknown): number | null {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;

  for (const key of ["champions", "data", "items", "results"]) {
    const value = candidate[key];
    if (Array.isArray(value)) {
      return value.length;
    }
    if (value && typeof value === "object") {
      return Object.keys(value as Record<string, unknown>).length;
    }
  }

  return Object.keys(candidate).length || null;
}

function extractChampionNames(payload: unknown): string[] {
  const collection = resolveChampionCollection(payload);
  if (!collection) {
    return [];
  }

  return collection
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const value =
        record.displayName ??
        record.name ??
        record.championName ??
        record.id ??
        record.slug;

      return typeof value === "string" ? value : null;
    })
    .filter((name): name is string => Boolean(name));
}

function resolveChampionCollection(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of ["champions", "data", "items", "results"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
    if (value && typeof value === "object") {
      return Object.values(value as Record<string, unknown>);
    }
  }

  return Object.values(record);
}
