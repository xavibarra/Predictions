import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MatchResult from "../components/MatchResult";
import { supabase } from "../lib/supabaseClient";
import "./Partidos.css";

function Partidos() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [scorersByMatch, setScorersByMatch] = useState({});
  const [topScorers, setTopScorers] = useState([]);
  const [activeTab, setActiveTab] = useState("partidos");
  const { t } = useTranslation();

  // Filtros
  const [statusFilter, setStatusFilter] = useState("all"); // all | finished | upcoming
  const [phaseFilter, setPhaseFilter] = useState("all"); // all | group | round_of_16 | ...

  useEffect(() => {
    async function load() {
      const [matchesRes, scorersRes] = await Promise.all([
        supabase
          .from("matches")
          .select(
            "*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)",
          )
          .order("match_date"),
        supabase
          .from("match_scorers")
          .select(
            "match_id, player_id, goals, player:players(id, name, team_id, team:teams(name, flag_url))",
          ),
      ]);

      const allMatches = matchesRes.data ?? [];
      const scorers = scorersRes.data ?? [];

      const byMatch = scorers.reduce((acc, s) => {
        if (!acc[s.match_id]) acc[s.match_id] = [];
        acc[s.match_id].push(s.player);
        return acc;
      }, {});

      const goalMap = {};
      scorers.forEach(({ player_id, goals, player }) => {
        if (!player) return;
        if (!goalMap[player_id]) goalMap[player_id] = { player, goals: 0 };
        goalMap[player_id].goals += goals ?? 1;
      });
      const sorted = Object.values(goalMap)
        .sort((a, b) => b.goals - a.goals)
        .filter((e) => e.goals > 0);

      setMatches(allMatches);
      setScorersByMatch(byMatch);
      setTopScorers(sorted);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p style={{ padding: "24px" }}>{t("partidos_loading")}</p>;

  // Fases distintas presentes en los datos
  const availablePhases = [
    ...new Set(matches.map((m) => m.phase).filter(Boolean)),
  ];

  // Aplicar filtros
  const filtered = matches.filter((m) => {
    const isFinished = m.home_score != null;
    if (statusFilter === "finished" && !isFinished) return false;
    if (statusFilter === "upcoming" && isFinished) return false;
    if (phaseFilter !== "all" && m.phase !== phaseFilter) return false;
    return true;
  });

  function getPhaseFilterLabel(ph) {
    return t(`phase_filter_${ph}`, { defaultValue: ph });
  }

  return (
    <div style={{ padding: "24px 0", width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ marginBottom: 6 }}>{t("partidos_title")}</h1>
      <p
        style={{ color: "var(--muted)", marginBottom: 20, fontSize: "0.95rem" }}
      >
        {t("partidos_subtitle")}
      </p>

      {/* Pestañas */}
      <div className="partidos-tabs">
        <button
          className={`partidos-tab ${activeTab === "partidos" ? "active" : ""}`}
          onClick={() => setActiveTab("partidos")}
        >
          {t("partidos_tab_matches")}
        </button>
        <button
          className={`partidos-tab ${activeTab === "goleadores" ? "active" : ""}`}
          onClick={() => setActiveTab("goleadores")}
        >
          {t("partidos_tab_scorers")}
          {topScorers.length > 0 && (
            <span className="partidos-tab-count">{topScorers.length}</span>
          )}
        </button>
      </div>

      {/* ─── Pestaña Partidos ─── */}
      {activeTab === "partidos" && (
        <>
          {/* Filtros */}
          <div className="partidos-filters">
            <div className="filter-group">
              <span className="filter-label">{t("filter_state")}</span>
              <div className="filter-pills">
                {[
                  { v: "all", l: t("filter_all") },
                  { v: "finished", l: t("filter_finished") },
                  { v: "upcoming", l: t("filter_upcoming") },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    className={`filter-pill ${statusFilter === v ? "active" : ""}`}
                    onClick={() => setStatusFilter(v)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {availablePhases.length > 1 && (
              <div className="filter-group">
                <span className="filter-label">{t("filter_phase")}</span>
                {/* Pills en desktop */}
                <div className="filter-pills filter-pills--desktop">
                  <button
                    className={`filter-pill ${phaseFilter === "all" ? "active" : ""}`}
                    onClick={() => setPhaseFilter("all")}
                  >
                    {t("filter_all_phases")}
                  </button>
                  {availablePhases.map((ph) => (
                    <button
                      key={ph}
                      className={`filter-pill ${phaseFilter === ph ? "active" : ""}`}
                      onClick={() => setPhaseFilter(ph)}
                    >
                      {getPhaseFilterLabel(ph)}
                    </button>
                  ))}
                </div>
                {/* Select en móvil */}
                <select
                  className="filter-select-mobile"
                  value={phaseFilter}
                  onChange={(e) => setPhaseFilter(e.target.value)}
                >
                  <option value="all">{t("filter_all_phases")}</option>
                  {availablePhases.map((ph) => (
                    <option key={ph} value={ph}>{getPhaseFilterLabel(ph)}</option>
                  ))}
                </select>
              </div>
            )}

            {filtered.length !== matches.length && (
              <span className="filter-count">
                {t("filter_count", { filtered: filtered.length, total: matches.length })}
              </span>
            )}
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "32px 0" }}>
              {t("filter_no_results")}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((match) => (
                <MatchResult
                  key={match.id}
                  match={match}
                  scorers={scorersByMatch[match.id] ?? []}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Pestaña Goleadores ─── */}
      {activeTab === "goleadores" && (
        <div className="scorers-list">
          {topScorers.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "32px 0" }}>
              {t("partidos_no_goals")}
            </p>
          ) : (
            topScorers.map((entry, index) => (
              <div key={entry.player.id} className="scorer-row">
                <span className="scorer-pos">{index + 1}</span>
                <img
                  src={entry.player.team?.flag_url}
                  alt={entry.player.team?.name}
                  className="scorer-flag"
                />
                <div className="scorer-info">
                  <span className="scorer-name">{entry.player.name}</span>
                  <span className="scorer-team">{entry.player.team?.name}</span>
                </div>
                <div className="scorer-goals">
                  <span className="scorer-goals-num">{entry.goals}</span>
                  <span className="scorer-goals-lbl">
                    {entry.goals !== 1 ? t("partidos_goals") : t("partidos_goal")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Partidos;
