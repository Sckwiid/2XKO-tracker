export type RiotAccountCluster = "europe" | "americas" | "asia";

export type RiotAccountDto = {
  puuid: string;
  gameName?: string;
  tagLine?: string;
};

export type TwoXkoQueue = "ranked" | "casual" | "tournament";

export type TwoXkoMatchIdsResponse = string[];

export type TwoXkoRankedStatsDto = {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
};

export type TwoXkoMatchDto = {
  metadata?: {
    match_id?: string;
    participants?: string[];
  };
  info?: {
    game_duration?: number;
    game_mode?: string;
    game_creation?: number | string;
    teams?: Array<{
      team_id?: number;
      won?: boolean;
      players?: Array<{
        puuid?: string;
        characters?: Array<{
          char_id?: string;
          skin_id?: number;
          is_anchor?: boolean;
        }>;
        stats?: {
          first_hits?: number;
          combo_peak?: number;
          assists_called?: number;
          bursts_used?: number;
          damage_dealt?: number;
          tags_performed?: number;
          rounds_played?: number;
          rounds?: number;
        };
      }>;
    }>;
  };
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
  ranked: {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    hotStreak: boolean;
  } | null;
  analytics: {
    sampleWindowMatches: number;
    queue: string | null;
    wins: number;
    losses: number;
    duoStats: Array<{
      duo: [string, string];
      wins: number;
      losses: number;
      totalMatches: number;
      winrate: number;
    }>;
    anchor: {
      topAnchorChar: string | null;
      topAnchorWinrate: number | null;
      byAnchorChar: Array<{
        charId: string;
        wins: number;
        losses: number;
        totalMatches: number;
        winrate: number;
      }>;
    };
    aggressivity: {
      badge: "Predateur" | "Standard" | "Indetermine";
      ratioFirstHitsPerRound: number | null;
      averageFirstHitsPerMatch: number;
      totalFirstHits: number;
      totalRoundsSeen: number | null;
    };
    recentMatches: Array<{
      matchId: string;
      result: "WIN" | "LOSS";
      duo: [string, string];
      anchorChar: string | null;
      gameMode: string | null;
      durationSeconds: number | null;
      firstHits: number | null;
      comboPeak: number | null;
    }>;
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
  warnings: string[];
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
