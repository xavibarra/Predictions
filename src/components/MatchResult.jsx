import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./MatchResult.css";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchResult({ match, scorers = [] }) {
  const [scorersOpen, setScorersOpen] = useState(false);
  const { t } = useTranslation();
  const hasResult = match.home_score != null && match.away_score != null;

  const homeScorers = scorers.filter((p) => p.team_id === match.home_team_id);
  const awayScorers = scorers.filter((p) => p.team_id === match.away_team_id);

  function getPhaseLabel(match) {
    if (!match.phase || match.phase === "group") {
      return t("phase_group", { name: match.home_team?.group_name ?? "" });
    }
    return t(`phase_${match.phase}`, { defaultValue: match.phase.toUpperCase() });
  }

  const scorerCount = scorers.length;
  const scorersLabel = scorerCount === 1
    ? t("match_result_scorers_one", { count: scorerCount })
    : t("match_result_scorers_other", { count: scorerCount });

  return (
    <div className={`match-result-card ${hasResult ? "finished" : ""}`}>
      {/* Cabecera */}
      <div className="mr-header">
        <span className="mr-badge">{getPhaseLabel(match)}</span>
        <div className="mr-header-right">
          <span className="mr-date">{formatDate(match.match_date)}</span>
          {hasResult && <span className="mr-status-badge">{t("match_result_fin")}</span>}
        </div>
      </div>

      {/* Equipos y marcador */}
      <div className="mr-teams">
        <div className="mr-team local">
          <span className="mr-team-name">{match.home_team?.name}</span>
          <img src={match.home_team?.flag_url} alt={match.home_team?.name} className="mr-flag" />
        </div>

        <div className="mr-score">
          {hasResult ? (
            <>
              <span className="mr-score-num">{match.home_score}</span>
              <span className="mr-score-sep">:</span>
              <span className="mr-score-num">{match.away_score}</span>
            </>
          ) : (
            <span className="mr-score-pending">— : —</span>
          )}
        </div>

        <div className="mr-team visitante">
          <img src={match.away_team?.flag_url} alt={match.away_team?.name} className="mr-flag" />
          <span className="mr-team-name">{match.away_team?.name}</span>
        </div>
      </div>

      {/* Goleadores — colapsables */}
      {scorers.length > 0 && (
        <>
          <button
            className="mr-scorers-toggle"
            onClick={() => setScorersOpen((o) => !o)}
          >
            <span>{scorersLabel}</span>
            <span className="mr-toggle-arrow">{scorersOpen ? "▲" : "▼"}</span>
          </button>

          {scorersOpen && (
            <div className="mr-scorers">
              <div className="mr-scorers-col">
                {homeScorers.map((player) => (
                  <div key={player.id} className="mr-scorer-row">
                    <span className="mr-goal-icon">⚽</span>
                    <img src={player.team?.flag_url} alt="" className="mr-scorer-flag" />
                    <span className="mr-scorer-name">{player.name}</span>
                  </div>
                ))}
              </div>
              <div className="mr-scorers-col">
                {awayScorers.map((player) => (
                  <div key={player.id} className="mr-scorer-row away">
                    <span className="mr-scorer-name">{player.name}</span>
                    <img src={player.team?.flag_url} alt="" className="mr-scorer-flag" />
                    <span className="mr-goal-icon">⚽</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
