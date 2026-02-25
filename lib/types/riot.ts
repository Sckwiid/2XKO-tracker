export type RiotAccountCluster = "europe" | "americas" | "asia";

export type RiotAccountDto = {
  puuid: string;
  gameName?: string;
  tagLine?: string;
};

export type RiotAccountLookupPayload = {
  ok: true;
  account: {
    puuid: string;
    gameName: string;
    tagLine: string;
    riotId: string;
    sourceCluster: RiotAccountCluster;
    fetchedAt: string;
  };
  persistedPlayer: {
    id: string;
    riotId: string;
    tagline: string;
    puuid: string;
  } | null;
  championCatalog: {
    sourceUrl: string;
    count: number | null;
    sampleNames: string[];
    fetchedAt: string;
  } | null;
  limitations: {
    hasPublic2XkoMatchApiInCatalog: boolean;
    requiresRsoPlayerOptIn: boolean;
    note: string;
  };
};

export type RiotAccountLookupErrorPayload = {
  ok: false;
  error: string;
  code:
    | "MISSING_RIOT_API_KEY"
    | "INVALID_RIOT_ID"
    | "ACCOUNT_NOT_FOUND"
    | "RIOT_UNAUTHORIZED"
    | "RIOT_FORBIDDEN"
    | "RIOT_RATE_LIMIT"
    | "RIOT_UPSTREAM_ERROR"
    | "INTERNAL_ERROR";
  status: number;
  details?: string;
};

export type RiotAccountLookupResponse =
  | RiotAccountLookupPayload
  | RiotAccountLookupErrorPayload;
