"use client";

import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { mockPlayerProfile } from "../lib/mocks/player-profile";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const totalGames = mockPlayerProfile.wins + mockPlayerProfile.losses;
  const globalWinrate = Math.round((mockPlayerProfile.wins / totalGames) * 100);

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,127,0.12),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(0,255,255,0.1),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(191,255,0,0.08),transparent_45%)]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-start gap-4"
        >
          <span className="hero-kicker px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
            Riot 2XKO • Duo Analytics • Mock UI
          </span>

          <div className="max-w-4xl">
            <h1 className="display-text text-5xl font-extrabold uppercase leading-[0.88] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Le Tracker <span className="text-neon-pink">2v2</span> qui lit la
              <span className="text-neon-cyan"> synergie</span>, pas juste les
              chiffres.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
              Dashboard orienté duo, clutch Anchor et style de jeu. Ambiance
              esport urbaine, taillée pour 2XKO.
            </p>
          </div>
        </motion.div>

        <motion.form
          {...fadeUp}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="panel-cut animate-pulse-neon relative p-3 shadow-panel"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label htmlFor="riot-id" className="sr-only">
              Riot ID
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Riot ID
              </span>
              <input
                id="riot-id"
                type="text"
                placeholder="Faker#EUW"
                defaultValue={mockPlayerProfile.riotId}
                className="h-14 w-full bg-black/30 pl-24 pr-4 text-base text-white outline-none ring-1 ring-white/10 transition focus:ring-cyan-300/40"
              />
            </div>
            <button
              type="submit"
              className="display-text h-14 min-w-36 bg-neon-pink px-6 text-xl font-extrabold uppercase tracking-[0.14em] text-black transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink"
              style={{
                clipPath:
                  "polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
            >
              Scan
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Format attendu: `Pseudo#TAG` (ex: `Faker#EUW`) • endpoint Riot à
            brancher plus tard.
          </p>
        </motion.form>

        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="space-y-6">
            <div className="panel-cut grid gap-5 p-5 shadow-panel sm:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Profil Joueur (Mock)
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                  <h2 className="display-text text-4xl font-extrabold uppercase text-white sm:text-5xl">
                    {mockPlayerProfile.riotId}
                  </h2>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    {mockPlayerProfile.region}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/5 px-3 py-1 text-cyan-200">
                    <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-[0_0_12px_rgba(0,255,255,.7)]" />
                    {mockPlayerProfile.rank}
                  </span>
                  <span className="display-text text-2xl font-extrabold text-neon-lime">
                    {mockPlayerProfile.lp} LP
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <StatTile label="WR Global" value={`${globalWinrate}%`} tone="pink" />
                  <StatTile
                    label="Victoires"
                    value={String(mockPlayerProfile.wins)}
                    tone="cyan"
                  />
                  <StatTile
                    label="Défaites"
                    value={String(mockPlayerProfile.losses)}
                    tone="lime"
                  />
                </div>
              </div>

              <div className="panel-cut panel-cut-lime grid-faint p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Team Signature
                </p>
                <div className="mt-4 space-y-3">
                  {mockPlayerProfile.mainTeam.map((champ, index) => (
                    <motion.div
                      key={champ}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.07, duration: 0.35 }}
                      className="flex items-center justify-between border border-white/5 bg-black/20 px-3 py-2"
                      style={{
                        clipPath:
                          "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <span className="display-text text-2xl font-bold uppercase text-white">
                        {champ}
                      </span>
                      <span className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                        {index === 0 ? "Point" : "Anchor"}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-zinc-400">
                  Preview UI pour cartes perso / duo avant intégration API Riot.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="panel-cut p-5 shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="display-text text-2xl font-bold uppercase text-white">
                    Winrate par Duo
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                    Synergie 2v2
                  </span>
                </div>
                <div className="space-y-3">
                  {mockPlayerProfile.duoWinrates.map((entry) => (
                    <div
                      key={entry.duo.join("-")}
                      className="grid grid-cols-[1fr_auto] gap-3 border border-white/5 bg-black/20 px-3 py-3"
                      style={{
                        clipPath:
                          "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <div>
                        <p className="display-text text-xl font-bold uppercase text-white">
                          {entry.duo[0]} + {entry.duo[1]}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {entry.matches} matchs trackés
                        </p>
                      </div>
                      <div className="flex min-w-24 flex-col items-end justify-center">
                        <p className="display-text text-2xl font-extrabold text-neon-pink">
                          {entry.winrate}%
                        </p>
                        <div className="mt-1 h-1.5 w-24 overflow-hidden bg-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan"
                            style={{ width: `${entry.winrate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="panel-cut panel-cut-lime p-5 shadow-panel">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="display-text text-2xl font-bold uppercase text-white">
                      Stat Anchor
                    </h3>
                    <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Clutch Mode
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SmallMetric
                      label="Winrate Anchor"
                      value={`${mockPlayerProfile.anchor.winrate}%`}
                      tone="lime"
                    />
                    <SmallMetric
                      label="Clutch Round"
                      value={`${mockPlayerProfile.anchor.clutchRoundRate}%`}
                      tone="cyan"
                    />
                    <SmallMetric
                      label="Combo DMG"
                      value={mockPlayerProfile.anchor.avgComboDamage.toLocaleString("fr-FR")}
                      tone="pink"
                    />
                    <SmallMetric
                      label="Rounds"
                      value={String(mockPlayerProfile.anchor.roundsTracked)}
                      tone="cyan"
                    />
                  </div>
                </div>

                <div className="panel-cut p-5 shadow-panel">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="display-text text-2xl font-bold uppercase text-white">
                      Recent Set Feed
                    </h3>
                    <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Mock
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mockPlayerProfile.recentMatches.map((match) => (
                      <div
                        key={match.id}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-white/5 bg-black/20 px-3 py-2"
                      >
                        <span
                          className={`display-text inline-flex min-w-9 justify-center px-2 py-1 text-lg font-bold ${
                            match.result === "W"
                              ? "bg-lime-300/15 text-neon-lime"
                              : "bg-pink-300/10 text-neon-pink"
                          }`}
                          style={{
                            clipPath:
                              "polygon(0 6px, 6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                          }}
                        >
                          {match.result}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">
                            {match.duo[0]} + {match.duo[1]}
                          </p>
                          <p className="text-xs text-zinc-400">{match.kdaLike}</p>
                        </div>
                        <span className="text-xs text-zinc-400">{match.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-cut p-5 shadow-panel">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="display-text text-2xl font-bold uppercase text-white">
                Radar Playstyle
              </h3>
              <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                Pentagone
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Vue mockée des axes clés pour le profil 2XKO: agressivité, défense,
              exécution combos, efficacité assist et first hit.
            </p>

            <div className="mt-4 h-[320px] rounded-sm border border-white/5 bg-black/20 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={mockPlayerProfile.playstyleRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "rgba(244,244,245,0.85)", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tickCount={5}
                    tick={{ fill: "rgba(161,161,170,0.7)", fontSize: 10 }}
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <Radar
                    name="Playstyle"
                    dataKey="value"
                    stroke="#00FFFF"
                    fill="#FF007F"
                    fillOpacity={0.35}
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#BFFF00", stroke: "#121212", strokeWidth: 1 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 text-sm">
              {mockPlayerProfile.playstyleRadar.map((entry) => (
                <div
                  key={entry.axis}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border border-white/5 px-3 py-2"
                  style={{
                    clipPath:
                      "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <span className="text-zinc-200">{entry.axis}</span>
                  <span className="display-text text-xl font-bold text-neon-cyan">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </section>
    </main>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pink" | "cyan" | "lime";
}) {
  const color =
    tone === "pink"
      ? "text-neon-pink"
      : tone === "cyan"
        ? "text-neon-cyan"
        : "text-neon-lime";

  return (
    <div className="border border-white/5 bg-black/20 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">{label}</p>
      <p className={`display-text mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pink" | "cyan" | "lime";
}) {
  const accent =
    tone === "pink"
      ? "border-pink-300/20 bg-pink-300/5 text-neon-pink"
      : tone === "cyan"
        ? "border-cyan-300/20 bg-cyan-300/5 text-neon-cyan"
        : "border-lime-300/20 bg-lime-300/5 text-neon-lime";

  return (
    <div className={`border px-3 py-3 ${accent}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="display-text mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
