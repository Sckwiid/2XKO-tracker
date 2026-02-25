"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Database, LoaderCircle, Search, Shield, Swords, UserRound } from "lucide-react";
import type { RiotAccountLookupPayload, RiotAccountLookupResponse } from "../lib/types/riot";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<RiotAccountLookupPayload | null>(null);

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
      const response = await fetch(`/api/riot/account?riotId=${encodeURIComponent(riotId)}`, {
        method: "GET",
        cache: "no-store",
      });

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
            Riot 2XKO • Live Account Lookup • Railway Ready
          </span>

          <div className="max-w-4xl">
            <h1 className="display-text text-5xl font-extrabold uppercase leading-[0.88] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Le Tracker <span className="text-neon-pink">2v2</span> passe en
              <span className="text-neon-cyan"> réel</span> avec Riot.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
              Lookup Riot ID officiel (PUUID) branché côté serveur via `RIOT_API_KEY`. Les
              stats match 2XKO restent bloquées tant que les endpoints publics ne sont pas
              exposés dans le catalogue API Riot.
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
                placeholder="Faker#EUW"
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
              {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
              {isLoading ? "Scan..." : "Scan"}
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Format attendu: `Pseudo#TAG` (ex: `Faker#EUW`) • API Riot officielle
            (`account-v1`) côté serveur.
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
                  Compte Riot (Live)
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
                            ? `Player upsert OK (${payload.persistedPlayer.id.slice(0, 8)}...)`
                            : "Lookup OK • DB sync non disponible"
                        }
                        tone="lime"
                      />
                      <IdentityRow
                        label="Fetched"
                        value={formatDateTime(payload.account.fetchedAt)}
                        tone="pink"
                      />
                    </div>
                  </>
                ) : (
                  <EmptyPanel
                    icon={<UserRound className="h-5 w-5 text-neon-cyan" />}
                    title="Aucun compte chargé"
                    description="Lance un scan Riot ID pour récupérer un PUUID réel et enregistrer le joueur en base."
                  />
                )}
              </div>

              <div className="panel-cut panel-cut-lime grid-faint p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Pipeline Live
                </p>
                <div className="mt-4 space-y-3">
                  <StatusChip
                    label="Client -> API Route"
                    value="OK"
                    tone="cyan"
                    active={Boolean(payload)}
                  />
                  <StatusChip
                    label="API Riot account-v1"
                    value={payload ? "LIVE" : "READY"}
                    tone="pink"
                    active={Boolean(payload)}
                  />
                  <StatusChip
                    label="Prisma Player Upsert"
                    value={payload?.persistedPlayer ? "SYNCED" : "PENDING"}
                    tone="lime"
                    active={Boolean(payload?.persistedPlayer)}
                  />
                </div>
                <p className="mt-4 text-xs text-zinc-400">
                  Les anciennes stats de démo ont été retirées. Affichage uniquement des
                  données réellement récupérées.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="panel-cut p-5 shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="display-text text-2xl font-bold uppercase text-white">
                    Statut API 2XKO
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                    Officiel
                  </span>
                </div>

                <div className="space-y-3">
                  <InfoBlock
                    icon={<Shield className="h-4 w-4 text-neon-cyan" />}
                    title="Riot ID Lookup"
                    body="Disponible et branché via Riot account-v1 (RIOT_API_KEY côté serveur)."
                  />
                  <InfoBlock
                    icon={<Swords className="h-4 w-4 text-neon-pink" />}
                    title="Match History 2XKO"
                    body="Non affiché ici pour l’instant: pas d’endpoint 2XKO match public exploitable visible dans le catalogue API Riot public."
                  />
                  <InfoBlock
                    icon={<Shield className="h-4 w-4 text-neon-lime" />}
                    title="Accès avancé 2XKO"
                    body="La doc 2XKO mentionne RSO + opt-in joueur pour l’historique de matchs (et clés de prod / approbation)."
                  />
                </div>

                {payload ? (
                  <p className="mt-4 text-xs text-zinc-400">{payload.limitations.note}</p>
                ) : null}
              </div>

              <div className="panel-cut panel-cut-lime p-5 shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="display-text text-2xl font-bold uppercase text-white">
                    2XKO Assets (Live)
                  </h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                    Champions
                  </span>
                </div>

                {payload?.championCatalog ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard
                        label="Catalog Count"
                        value={
                          payload.championCatalog.count !== null
                            ? String(payload.championCatalog.count)
                            : "N/A"
                        }
                        tone="lime"
                      />
                      <MetricCard
                        label="Fetched"
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
                        <p className="text-xs text-zinc-400">
                          Catalogue récupéré, mais format non reconnu pour extraire des noms.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <EmptyPanel
                    icon={<Database className="h-5 w-5 text-neon-lime" />}
                    title="Catalogue non chargé"
                    description="Le backend tente aussi de lire le catalogue champions 2XKO officiel après le lookup Riot."
                  />
                )}
              </div>
            </div>
          </div>

          <div className="panel-cut p-5 shadow-panel">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="display-text text-2xl font-bold uppercase text-white">
                Roadmap Data Réelle
              </h3>
              <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                Next
              </span>
            </div>

            <p className="text-sm text-zinc-400">
              Le socle “réel” est actif: lookup Riot + persistence en base. Dès qu’on a la doc
              endpoint match 2XKO (ou accès approuvé), on branche les stats duo/anchor/radar sur
              les tables Prisma déjà préparées.
            </p>

            <div className="mt-4 space-y-3">
              <RoadmapRow
                step="1"
                title="Lookup Riot ID -> PUUID"
                description="API officielle Riot account-v1 • déjà connecté"
                status={payload ? "done" : "ready"}
              />
              <RoadmapRow
                step="2"
                title="Collecte Matchs 2XKO"
                description="En attente d’endpoints publics / accès produit"
                status="blocked"
              />
              <RoadmapRow
                step="3"
                title="Agrégation DuoStat / Anchor"
                description="Calcul Prisma + caches DB + dashboards"
                status="ready"
              />
              <RoadmapRow
                step="4"
                title="Radar Playstyle (Recharts)"
                description="Réactivation quand la donnée réelle existe"
                status="ready"
              />
            </div>

            <div className="mt-5 border border-white/5 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                Ce qui a changé
              </p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-200">
                <li>Fausses données de profil retirées.</li>
                <li>Recherche Riot ID branchée à l’API officielle côté serveur.</li>
                <li>PUUID persisté en PostgreSQL via Prisma (upsert `Player`).</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </section>
    </main>
  );
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
      ? "border-pink-300/20 bg-pink-300/5 text-neon-pink"
      : tone === "cyan"
        ? "border-cyan-300/20 bg-cyan-300/5 text-neon-cyan"
        : "border-lime-300/20 bg-lime-300/5 text-neon-lime";

  return (
    <div className={`border px-3 py-3 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p
        className={`mt-1 text-sm font-medium text-white ${mono ? "font-mono break-all" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusChip({
  label,
  value,
  tone,
  active,
}: {
  label: string;
  value: string;
  tone: "pink" | "cyan" | "lime";
  active: boolean;
}) {
  const accent =
    tone === "pink"
      ? "text-neon-pink"
      : tone === "cyan"
        ? "text-neon-cyan"
        : "text-neon-lime";

  return (
    <div className="flex items-center justify-between border border-white/5 bg-black/20 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.15em] text-zinc-300">{label}</span>
      <span
        className={`display-text text-lg font-bold uppercase ${accent} ${
          active ? "" : "opacity-70"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="border border-white/5 bg-black/20 p-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="display-text text-lg font-bold uppercase text-white">{title}</p>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
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

function RoadmapRow({
  step,
  title,
  description,
  status,
}: {
  step: string;
  title: string;
  description: string;
  status: "done" | "ready" | "blocked";
}) {
  const statusLabel = status === "done" ? "Done" : status === "blocked" ? "Blocked" : "Ready";
  const statusClass =
    status === "done"
      ? "text-neon-lime"
      : status === "blocked"
        ? "text-neon-pink"
        : "text-neon-cyan";

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-white/5 bg-black/20 px-3 py-3">
      <span
        className="display-text inline-flex min-w-8 justify-center bg-white/5 px-2 py-1 text-lg font-bold text-white"
        style={{
          clipPath:
            "polygon(0 6px, 6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
        }}
      >
        {step}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-white">{title}</p>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
      <span className={`display-text text-lg font-bold uppercase ${statusClass}`}>
        {statusLabel}
      </span>
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
