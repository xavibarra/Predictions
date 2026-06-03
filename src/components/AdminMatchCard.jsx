import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./AdminMatchCard.css";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const POSITION_ORDER = { portero: 0, defensa: 1, centrocampista: 2, atacante: 3 };

function sortByPosition(a, b) {
  return (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9);
}

export default function AdminMatchCard({
  match,
  players = [],
  existingScorers = [],
  onSave,
}) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? "");
  const [awayScore, setAwayScore] = useState(match.away_score ?? "");

  // { [playerId]: goalsCount } — si está en el objeto, marcó
  const [scorers, setScorers] = useState(() =>
    existingScorers.reduce((acc, s) => {
      acc[s.player_id] = s.goals;
      return acc;
    }, {}),
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [playersOpen, setPlayersOpen] = useState(false);
  const { t } = useTranslation();

  const homePlayers = players
    .filter((p) => p.team_id === match.home_team_id)
    .sort(sortByPosition);
  const awayPlayers = players
    .filter((p) => p.team_id === match.away_team_id)
    .sort(sortByPosition);

  function toggleScorer(playerId) {
    setScorers((prev) => {
      if (prev[playerId] !== undefined) {
        const { [playerId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [playerId]: 1 };
    });
  }

  function changeGoals(playerId, delta) {
    setScorers((prev) => {
      const current = prev[playerId] ?? 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [playerId]: next };
    });
  }

  async function handleSave() {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setError(t("admin_invalid_score"));
      return;
    }

    setError(null);
    setSaving(true);

    const scorerList = Object.entries(scorers).map(([playerId, goals]) => ({
      playerId: Number(playerId),
      goals,
    }));

    const ok = await onSave(match.id, home, away, scorerList);

    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(t("admin_save_error"));
    }
  }

  const hasResult = match.home_score != null;

  return (
    <div className={`admin-card ${hasResult ? "admin-card--done" : ""}`}>
      {/* Cabecera */}
      <div className="admin-card__header">
        <span className="admin-card__badge">
          {t("match_group", { name: match.home_team?.group_name })}
        </span>
        <div className="admin-card__header-right">
          <span className="admin-card__date">{formatDate(match.match_date)}</span>
          {hasResult && <span className="admin-card__done-badge">{t("admin_saved_badge")}</span>}
        </div>
      </div>

      {/* Marcador */}
      <div className="admin-card__score-row">
        <div className="admin-team admin-team--home">
          <span className="admin-team__name">{match.home_team?.name}</span>
          <img
            src={match.home_team?.flag_url}
            alt={match.home_team?.name}
            className="admin-team__flag"
          />
        </div>

        <div className="admin-score-inputs">
          <input
            type="number"
            min="0"
            placeholder="—"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="admin-score-box"
          />
          <span className="admin-score-sep">:</span>
          <input
            type="number"
            min="0"
            placeholder="—"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="admin-score-box"
          />
        </div>

        <div className="admin-team admin-team--away">
          <img
            src={match.away_team?.flag_url}
            alt={match.away_team?.name}
            className="admin-team__flag"
          />
          <span className="admin-team__name">{match.away_team?.name}</span>
        </div>
      </div>

      {/* Goleadores — colapsables */}
      <div className="admin-scorers">
        <button
          className="admin-scorers__toggle"
          onClick={() => setPlayersOpen((o) => !o)}
        >
          <span className="admin-scorers__label">
            {t("admin_scorers")}
            {Object.keys(scorers).length > 0 && (
              <span className="admin-scorers__count">
                {" "}· {Object.keys(scorers).length} {t("admin_marked")}
              </span>
            )}
          </span>
          <span className="admin-toggle-arrow">{playersOpen ? "▲" : "▼"}</span>
        </button>

        {!playersOpen && Object.keys(scorers).length > 0 && (
          <div className="admin-scorers__summary">
            {Object.entries(scorers).map(([pid, goals]) => {
              const player = players.find((p) => p.id === Number(pid));
              if (!player) return null;
              return (
                <span key={pid} className="admin-scorer-pill">
                  ⚽ {player.name} {goals > 1 ? `×${goals}` : ""}
                </span>
              );
            })}
          </div>
        )}

        {playersOpen && (
        <div className="admin-scorers__cols">
          {/* Equipo local */}
          <div className="admin-scorers__col">
            <p className="admin-scorers__team-name">
              <img
                src={match.home_team?.flag_url}
                alt=""
                className="admin-scorers__mini-flag"
              />
              {match.home_team?.name}
            </p>
            {homePlayers.map((player) => {
              const scored = scorers[player.id] !== undefined;
              return (
                <div
                  key={player.id}
                  className={`admin-player ${scored ? "admin-player--scored" : ""}`}
                >
                  <button
                    className="admin-player__toggle"
                    onClick={() => toggleScorer(player.id)}
                    title={scored ? "Quitar goleador" : "Marcar como goleador"}
                  >
                    {scored ? "⚽" : "○"}
                  </button>
                  <span className="admin-player__name">{player.name}</span>
                  <span className="admin-player__pos">
                    {player.position?.substring(0, 3).toUpperCase()}
                  </span>
                  {scored && (
                    <div className="admin-player__goals">
                      <button
                        className="admin-goals-btn"
                        onClick={() => changeGoals(player.id, -1)}
                      >
                        −
                      </button>
                      <span className="admin-goals-count">
                        {scorers[player.id]}
                      </span>
                      <button
                        className="admin-goals-btn"
                        onClick={() => changeGoals(player.id, +1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Equipo visitante */}
          <div className="admin-scorers__col">
            <p className="admin-scorers__team-name">
              <img
                src={match.away_team?.flag_url}
                alt=""
                className="admin-scorers__mini-flag"
              />
              {match.away_team?.name}
            </p>
            {awayPlayers.map((player) => {
              const scored = scorers[player.id] !== undefined;
              return (
                <div
                  key={player.id}
                  className={`admin-player ${scored ? "admin-player--scored" : ""}`}
                >
                  <button
                    className="admin-player__toggle"
                    onClick={() => toggleScorer(player.id)}
                    title={scored ? "Quitar goleador" : "Marcar como goleador"}
                  >
                    {scored ? "⚽" : "○"}
                  </button>
                  <span className="admin-player__name">{player.name}</span>
                  <span className="admin-player__pos">
                    {player.position?.substring(0, 3).toUpperCase()}
                  </span>
                  {scored && (
                    <div className="admin-player__goals">
                      <button
                        className="admin-goals-btn"
                        onClick={() => changeGoals(player.id, -1)}
                      >
                        −
                      </button>
                      <span className="admin-goals-count">
                        {scorers[player.id]}
                      </span>
                      <button
                        className="admin-goals-btn"
                        onClick={() => changeGoals(player.id, +1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Pie — error + botón */}
      <div className="admin-card__footer">
        {error && <p className="admin-card__error">{error}</p>}
        {saved && <p className="admin-card__saved">{t("admin_saved")}</p>}
        <button
          className="admin-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? t("admin_saving") : t("admin_save")}
        </button>
      </div>
    </div>
  );
}
