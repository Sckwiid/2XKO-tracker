export type DuoWinrate = {
  duo: [string, string];
  winrate: number;
  matches: number;
};

export type RadarAxis = {
  axis: string;
  value: number;
  fullMark: number;
};

export type PlayerProfileMock = {
  riotId: string;
  region: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  mainTeam: [string, string];
  anchor: {
    winrate: number;
    clutchRoundRate: number;
    avgComboDamage: number;
    roundsTracked: number;
  };
  duoWinrates: DuoWinrate[];
  playstyleRadar: RadarAxis[];
  recentMatches: Array<{
    id: string;
    result: "W" | "L";
    duo: [string, string];
    kdaLike: string;
    duration: string;
  }>;
};

export const mockPlayerProfile: PlayerProfileMock = {
  riotId: "Faker#EUW",
  region: "EUW",
  rank: "Alpha Grandmaster",
  lp: 428,
  wins: 214,
  losses: 128,
  mainTeam: ["Ahri", "Ekko"],
  anchor: {
    winrate: 58,
    clutchRoundRate: 34,
    avgComboDamage: 4120,
    roundsTracked: 287,
  },
  duoWinrates: [
    { duo: ["Ahri", "Ekko"], winrate: 62, matches: 143 },
    { duo: ["Yasuo", "Illaoi"], winrate: 55, matches: 89 },
    { duo: ["Darius", "Ahri"], winrate: 51, matches: 72 },
    { duo: ["Ekko", "Braum"], winrate: 64, matches: 58 },
  ],
  playstyleRadar: [
    { axis: "Agressivité", value: 84, fullMark: 100 },
    { axis: "Défense", value: 58, fullMark: 100 },
    { axis: "Combos", value: 91, fullMark: 100 },
    { axis: "Assists", value: 77, fullMark: 100 },
    { axis: "First Hit", value: 69, fullMark: 100 },
  ],
  recentMatches: [
    {
      id: "m_01",
      result: "W",
      duo: ["Ahri", "Ekko"],
      kdaLike: "2.8 K/O Ratio",
      duration: "08:44",
    },
    {
      id: "m_02",
      result: "W",
      duo: ["Ekko", "Braum"],
      kdaLike: "2.2 K/O Ratio",
      duration: "10:02",
    },
    {
      id: "m_03",
      result: "L",
      duo: ["Yasuo", "Illaoi"],
      kdaLike: "1.4 K/O Ratio",
      duration: "07:31",
    },
    {
      id: "m_04",
      result: "W",
      duo: ["Ahri", "Ekko"],
      kdaLike: "3.1 K/O Ratio",
      duration: "09:13",
    },
  ],
};
