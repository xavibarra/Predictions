import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./GroupStage.css";
import MatchCard from "./MatchCard";

function GroupStage({ matches, players, predictions, onSave }) {
  const [statusFilter, setStatusFilter] = useState("all"); // all | predicted | unpredicted
  const [groupFilter, setGroupFilter] = useState("all");
  const { t } = useTranslation();

  const availableGroups = [...new Set(
    matches.map((m) => m.home_team?.group_name).filter(Boolean)
  )].sort();

  const filtered = matches.filter((m) => {
    const hasPred = !!predictions[m.id];
    if (statusFilter === "predicted" && !hasPred) return false;
    if (statusFilter === "unpredicted" && hasPred) return false;
    if (groupFilter !== "all" && m.home_team?.group_name !== groupFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Filtros */}
      <div className="gs-filters">
        <div className="gs-filter-group">
          <span className="gs-filter-label">{t("gs_filter_state")}</span>
          <div className="gs-pills">
            {[
              { v: "all", l: t("gs_filter_all") },
              { v: "predicted", l: t("gs_filter_predicted") },
              { v: "unpredicted", l: t("gs_filter_unpredicted") },
            ].map(({ v, l }) => (
              <button
                key={v}
                className={`gs-pill ${statusFilter === v ? "active" : ""}`}
                onClick={() => setStatusFilter(v)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {availableGroups.length > 1 && (
          <div className="gs-filter-group">
            <span className="gs-filter-label">{t("gs_filter_group")}</span>
            <div className="gs-pills">
              <button
                className={`gs-pill ${groupFilter === "all" ? "active" : ""}`}
                onClick={() => setGroupFilter("all")}
              >
                {t("gs_filter_all")}
              </button>
              {availableGroups.map((g) => (
                <button
                  key={g}
                  className={`gs-pill ${groupFilter === g ? "active" : ""}`}
                  onClick={() => setGroupFilter(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length !== matches.length && (
          <span className="gs-count">
            {t("gs_filter_count", { filtered: filtered.length, total: matches.length })}
          </span>
        )}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "24px 0" }}>
          {t("gs_no_results")}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              players={players.filter(
                (p) =>
                  p.team_id === match.home_team_id ||
                  p.team_id === match.away_team_id,
              )}
              prediction={predictions[match.id]}
              allPredictions={predictions}
              onSave={onSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupStage;
