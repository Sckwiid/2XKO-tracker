"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Crown,
  Flame,
  Lock,
  Search,
  Shield,
  Swords,
  UserRound,
  Zap,
} from "lucide-react";
import type { RiotAccountLookupPayload, RiotAccountLookupResponse } from "../lib/types/riot";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

type X2koAvailability = {
  canReadRanked: boolean;
  canReadMatches: boolean;
  has403Ranked: boolean;
  has403Matches: boolean;
  warnings: string[];
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<RiotAccountLookupPayload | null>(null);

  const availability = useMemo(() => derive2XkoAvailability(payload), [payload]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const riotId = query.trim();

    if (!riotId) {
      setError("Entre un Riot ID au format `Pseudo#TAG`.");
      setPayload(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/riot/account?riotId=${encodeURIComponent(riotId)}&queue=ranked&count=20`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const json = (await response.json()) as RiotAccountLookupResponse;

      if (!json.ok) {
        setPayload(null);
        setError(json.error || "Erreur inconnue pendant le lookup Riot.");
        return;
      }

      if (!response.ok) {
        setPayload(null);
        setError("Réponse API invalide.");
        return;
      }

      setPayload(json);
    } catch {
      setPayload(null);
      setError("Impossible de contacter le backend du tracker pour le lookup Riot.");
    } finally {
      setIsLoading(false);
    }
  }

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
            2XKO Tracker • Riot ID Live • Duo Analytics Ready
          </span>

          <div className="max-w-4xl">
            <h1 className="display-text text-5xl font-extrabold uppercase leading-[0.88] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Stats <span className="text-neon-pink">réelles</span> quand Riot les expose,
              <span className="text-neon-cyan"> instantané</span> quand tu scans.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
              Le site affiche maintenant uniquement des données réelles. Avec ta clé actuelle,
              le lookup Riot ID est disponible et les stats 2XKO s’affichent automatiquement si
              les endpoints match/ranked sont autorisés.
            </p>
          </div>
        </motion.div>

        <motion.form
          {...fadeUp}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="panel-cut animate-pulse-neon relative p-3 shadow-panel"
          onSubmit={onSubmit}
        >
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label htmlFor="riot-id" className="sr-only">
              Riot ID
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="riot-id"
                type="text"
                placeholder="SCKWIID#1910"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-14 w-full bg-black/30 pl-11 pr-4 text-base text-white outline-none ring-1 ring-white/10 transition focus:ring-cyan-300/40"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="display-text inline-flex h-14 min-w-36 items-center justify-center gap-2 bg-neon-pink px-6 text-xl font-extrabold uppercase tracking-[0.14em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink"
              style={{
                clipPath:
                  "polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
            >
              {isLoading ? <Zap className="h-5 w-5 animate-pulse" /> : null}
              {isLoading ? "Scan..." : "Scan"}
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-400">
            Format `Pseudo#TAG` • le backend interroge `account-v1`, puis tente `2XKO-RANKED-V1`
            et `2XKO-MATCH-V1`.
          </p>

          {error ? (
            <div className="mt-3 flex items-start gap-2 border border-pink-300/20 bg-pink-300/5 px-3 py-2 text-sm text-pink-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neon-pink" />
              <p>{error}</p>
            </div>
          ) : null}
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
                  Profil Joueur (Réel)
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                {payload ? (
                  <>
                    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                      <h2 className="display-text text-4xl font-extrabold uppercase text-white sm:text-5xl">
                        {payload.account.riotId}
                      </h2>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        {payload.account.sourceCluster}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <IdentityRow label="PUUID" value={payload.account.puuid} tone="cyan" mono />
                      <IdentityRow
                        label="DB Sync"
                        value={
                          payload.persistedPlayer
                            ? `Player enregistré (${payload.persistedPlayer.id.slice(0, 8)}...)`
                            : "Lookup OK • Écriture DB indisponible"
                        }
                        tone="lime"
                      />
                      <IdentityRow
                        label="Dernier scan"
                        value={formatDateTime(payload.account.fetchedAt)}
                        tone="pink"
                      />
                    </div>
                  </>
                ) : (
                  <EmptyPanel
                    icon={<UserRound className="h-5 w-5 text-neon-cyan" />}
                    title="Aucun joueur chargé"
                    description="Recherche un Riot ID pour charger le profil et tenter les stats 2XKO réelles."
                  />
                )}
              </div>

              <div className="panel-cut panel-cut-lime grid-faint p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Résumé 2XKO</p>

                {payload ? (
                  <div className="mt-4 space-y-3">
                    <StatusLine
                      label="Ranked"
                      value={payload.ranked ? "Données reçues" : availability.has403Ranked ? "Accès Riot refusé (403)" : "Non disponible"}
                      tone={payload.ranked ? "lime" : "pink"}
                    />
                    <StatusLine
                      label="Match History"
                      value={payload.analytics ? `${payload.analytics.sampleWindowMatches} matchs sample` : availability.has403Matches ? "Accès Riot refusé (403)" : "Non disponible"}
                      tone={payload.analytics ? "lime" : "pink"}
                    />
                    <StatusLine
                      label="Duo / Anchor / Aggro"
                      value={payload.analytics ? "Calculés" : "En attente d’accès match-v1"}
                      tone={payload.analytics ? "cyan" : "pink"}
                    />
                  </div>
                ) : (
                  <EmptyPanel
                    icon={<Shield className="h-5 w-5 text-neon-lime" />}
                    title="Prêt au scan"
                    description="Le dashboard affiche automatiquement les stats réelles disponibles pour la clé Riot configurée."
                  />
                )}
              </div>
            </div>

            {payload ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="panel-cut p-5 shadow-panel">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="display-text text-2xl font-bold uppercase text-white">
                      Ranked 2XKO
                    </h3>
                    <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Live
                    </span>
                  </div>

                  {payload.ranked ? (
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard
                        label="Tier"
                        value={`${payload.ranked.tier} ${payload.ranked.rank}`}
                        tone="cyan"
                      />
                      <MetricCard
                        label="League Points"
                        value={String(payload.ranked.leaguePoints)}
                        tone="lime"
                      />
                      <MetricCard
                        label="Wins"
                        value={String(payload.ranked.wins)}
                        tone="pink"
                      />
                      <MetricCard
                        label="Losses"
                        value={String(payload.ranked.losses)}
                        tone="cyan"
                      />
                    </div>
                  ) : (
                    <LockedStatsCard
                      title="Stats ranked indisponibles"
                      lines={buildLockedLines(availability, "ranked")}
                    />
                  )}
                </div>

                <div className="panel-cut panel-cut-lime p-5 shadow-panel">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="display-text text-2xl font-bold uppercase text-white">
                      Snapshot Playstyle
                    </h3>
                    <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Réel
                    </span>
                  </div>

                  {payload.analytics ? (
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard
                        label="Aggro Badge"
                        value={payload.analytics.aggressivity.badge}
                        tone={payload.analytics.aggressivity.badge === "Predateur" ? "pink" : "lime"}
                      />
                      <MetricCard
                        label="First Hit Ratio"
                        value={
                          payload.analytics.aggressivity.ratioFirstHitsPerRound !== null
                            ? String(payload.analytics.aggressivity.ratioFirstHitsPerRound)
                            : "N/A"
                        }
                        tone="cyan"
                      />
                      <MetricCard
                        label="Total First Hits"
                        value={String(payload.analytics.aggressivity.totalFirstHits)}
                        tone="pink"
                      />
                      <MetricCard
                        label="Sample WR"
                        value={`${safeWinrate(payload.analytics.wins, payload.analytics.losses)}%`}
                        tone="lime"
                      />
                    </div>
                  ) : (
                    <LockedStatsCard
                      title="Playstyle indisponible"
                      lines={buildLockedLines(availability, "match")}
                    />
                  )}
                </div>
              </div>
            ) : null}

            {payload?.analytics ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="panel-cut p-5 shadow-panel">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="display-text text-2xl font-bold uppercase text-white">
                        Winrate par Duo
                      </h3>
                      <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                        Sample {payload.analytics.sampleWindowMatches}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {payload.analytics.duoStats.length > 0 ? (
                        payload.analytics.duoStats.map((entry) => (
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
                                {entry.wins}W / {entry.losses}L • {entry.totalMatches} matchs
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
                        ))
                      ) : (
                        <p className="text-sm text-zinc-400">Aucun duo exploitable dans cet échantillon.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="panel-cut panel-cut-lime p-5 shadow-panel">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="display-text text-2xl font-bold uppercase text-white">
                          Anchor Efficiency
                        </h3>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Sample
                        </span>
                      </div>

                      <div className="grid gap-2">
                        {payload.analytics.anchor.byAnchorChar.length > 0 ? (
                          payload.analytics.anchor.byAnchorChar.slice(0, 5).map((anchor) => (
                            <div
                              key={anchor.charId}
                              className="grid grid-cols-[1fr_auto] items-center gap-3 border border-white/5 bg-black/20 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm text-white">{anchor.charId}</p>
                                <p className="text-xs text-zinc-400">
                                  {anchor.wins}W / {anchor.losses}L ({anchor.totalMatches})
                                </p>
                              </div>
                              <span className="display-text text-xl font-bold text-neon-lime">
                                {anchor.winrate}%
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-zinc-400">Pas de données d’ancre exploitables.</p>
                        )}
                      </div>
                    </div>

                    <div className="panel-cut p-5 shadow-panel">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="display-text text-2xl font-bold uppercase text-white">
                          Recent Matches
                        </h3>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Réel
                        </span>
                      </div>

                      <div className="space-y-2">
                        {payload.analytics.recentMatches.length > 0 ? (
                          payload.analytics.recentMatches.map((match) => (
                            <div
                              key={match.matchId}
                              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-white/5 bg-black/20 px-3 py-2"
                            >
                              <span
                                className={`display-text inline-flex min-w-9 justify-center px-2 py-1 text-lg font-bold ${
                                  match.result === "WIN"
                                    ? "bg-lime-300/15 text-neon-lime"
                                    : "bg-pink-300/10 text-neon-pink"
                                }`}
                                style={{
                                  clipPath:
                                    "polygon(0 6px, 6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                                }}
                              >
                                {match.result === "WIN" ? "W" : "L"}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm text-white">
                                  {match.duo[0]} + {match.duo[1]}
                                </p>
                                <p className="truncate text-xs text-zinc-400">
                                  {match.gameMode ?? "N/A"} • Anchor {match.anchorChar ?? "N/A"} • FH {match.firstHits ?? "N/A"} • Combo {match.comboPeak ?? "N/A"}
                                </p>
                              </div>
                              <span className="text-xs text-zinc-400">{formatDuration(match.durationSeconds)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-zinc-400">Aucun match récent disponible.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="panel-cut p-5 shadow-panel">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="display-text text-2xl font-bold uppercase text-white">
                  État d’accès 2XKO
                </h3>
                <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                  Riot
                </span>
              </div>

              {payload ? (
                <div className="space-y-4">
                  {(availability.has403Ranked || availability.has403Matches) && (
                    <div className="border border-pink-300/20 bg-pink-300/5 p-4">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-neon-pink" />
                        <p className="display-text text-lg font-bold uppercase text-white">
                          Clé Riot insuffisante pour 2XKO
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-zinc-200">
                        Ta clé fonctionne pour `account-v1`, mais Riot renvoie `403` sur les routes
                        2XKO `match-v1` et/ou `ranked-v1`. Du coup, on ne peut pas récupérer les
                        vrais matchs, le rang 2XKO, ni calculer Duo/Anchor/Aggro.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-3">
                    <AccessRow
                      icon={<Crown className="h-4 w-4 text-neon-lime" />}
                      title="2XKO Ranked"
                      status={payload.ranked ? "Disponible" : availability.has403Ranked ? "403 Riot (clé non autorisée)" : "Indisponible"}
                    />
                    <AccessRow
                      icon={<Swords className="h-4 w-4 text-neon-pink" />}
                      title="2XKO Match History"
                      status={payload.analytics ? "Disponible" : availability.has403Matches ? "403 Riot (clé non autorisée)" : "Indisponible"}
                    />
                    <AccessRow
                      icon={<Flame className="h-4 w-4 text-neon-cyan" />}
                      title="Duo / Anchor / Agressivité"
                      status={payload.analytics ? "Calculés à partir des matchs" : "Bloqués tant que match-v1 n’est pas accessible"}
                    />
                  </div>

                  {availability.warnings.length > 0 ? (
                    <div className="border border-white/5 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                        Détails techniques (résumé)
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                        {availability.warnings.slice(0, 4).map((warning, index) => (
                          <li key={`${warning}-${index}`}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <EmptyPanel
                  icon={<Shield className="h-5 w-5 text-neon-cyan" />}
                  title="En attente d’un scan"
                  description="Le panneau affichera automatiquement ce que la clé Riot permet réellement de récupérer pour le joueur recherché."
                />
              )}
            </div>

            {payload?.championCatalog ? (
              <div className="panel-cut panel-cut-lime p-5 shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="display-text text-2xl font-bold uppercase text-white">
                    2XKO Assets
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                    Live Catalog
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Champions"
                    value={payload.championCatalog.count !== null ? String(payload.championCatalog.count) : "N/A"}
                    tone="lime"
                  />
                  <MetricCard
                    label="Fetch"
                    value={timeOnly(payload.championCatalog.fetchedAt)}
                    tone="cyan"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {payload.championCatalog.sampleNames.length > 0 ? (
                    payload.championCatalog.sampleNames.map((name) => (
                      <span
                        key={name}
                        className="border border-white/10 bg-black/20 px-2 py-1 text-xs text-zinc-200"
                        style={{
                          clipPath:
                            "polygon(0 6px, 6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                        }}
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400">Catalogue récupéré, noms non normalisés.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </motion.section>
      </section>
    </main>
  );
}

function derive2XkoAvailability(payload: RiotAccountLookupPayload | null): X2koAvailability {
  if (!payload) {
    return {
      canReadRanked: false,
      canReadMatches: false,
      has403Ranked: false,
      has403Matches: false,
      warnings: [],
    };
  }

  const warnings = payload.warnings ?? [];
  const lowerWarnings = warnings.map((warning) => warning.toLowerCase());
  const has403Ranked = lowerWarnings.some(
    (warning) => warning.includes("ranked-v1") && warning.includes("(403)"),
  );
  const has403Matches = lowerWarnings.some(
    (warning) =>
      (warning.includes("match-v1 ids") || warning.includes("match-v1 detail")) &&
      warning.includes("(403)"),
  );

  return {
    canReadRanked: Boolean(payload.ranked),
    canReadMatches: Boolean(payload.analytics),
    has403Ranked,
    has403Matches,
    warnings,
  };
}

function buildLockedLines(availability: X2koAvailability, scope: "ranked" | "match") {
  if (scope === "ranked") {
    if (availability.has403Ranked) {
      return [
        "Riot renvoie 403 sur 2XKO-RANKED-V1 avec la clé actuelle.",
        "Le site ne peut pas afficher le grade 2XKO réel tant que l’accès n’est pas autorisé.",
      ];
    }
    return ["Aucune donnée ranked reçue pour ce joueur (ou route indisponible)."];
  }

  if (availability.has403Matches) {
    return [
      "Riot renvoie 403 sur 2XKO-MATCH-V1 avec la clé actuelle.",
      "Duo / Anchor / Agressivité nécessitent l’historique de matchs réel.",
    ];
  }

  return ["Aucun match 2XKO récupéré pour ce joueur (ou route indisponible)."];
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-2 border border-white/5 bg-black/20 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="display-text text-xl font-bold uppercase text-white">{title}</p>
      </div>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function IdentityRow({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone: "pink" | "cyan" | "lime";
  mono?: boolean;
}) {
  const toneClass =
    tone === "pink"
      ? "border-pink-300/20 bg-pink-300/5"
      : tone === "cyan"
        ? "border-cyan-300/20 bg-cyan-300/5"
        : "border-lime-300/20 bg-lime-300/5";

  return (
    <div className={`border px-3 py-3 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className={`mt-1 text-sm font-medium text-white ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function StatusLine({
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
    <div className="flex items-center justify-between border border-white/5 bg-black/20 px-3 py-2 gap-3">
      <span className="text-xs uppercase tracking-[0.15em] text-zinc-300">{label}</span>
      <span className={`text-right text-xs font-semibold uppercase tracking-[0.14em] ${color}`}>
        {value}
      </span>
    </div>
  );
}

function LockedStatsCard({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="border border-pink-300/20 bg-pink-300/5 p-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-neon-pink" />
        <p className="display-text text-lg font-bold uppercase text-white">{title}</p>
      </div>
      <div className="mt-2 space-y-1 text-sm text-zinc-200">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function AccessRow({
  icon,
  title,
  status,
}: {
  icon: ReactNode;
  title: string;
  status: string;
}) {
  return (
    <div className="border border-white/5 bg-black/20 p-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="display-text text-lg font-bold uppercase text-white">{title}</p>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{status}</p>
    </div>
  );
}

function MetricCard({
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

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function timeOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function safeWinrate(wins: number, losses: number) {
  const total = wins + losses;
  if (total <= 0) {
    return 0;
  }
  return Math.round((wins / total) * 100);
}

function formatDuration(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "N/A";
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
