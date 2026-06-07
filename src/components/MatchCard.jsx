import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./MatchCard.css";
import PlayerSelect from "./PlayerSelect";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchCard({
  match,
  players = [],
  onSave,
  prediction,
  allPredictions = {},
}) {
  const [homeScore, setHomeScore] = useState(
    prediction?.predicted_home_score ?? "",
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.predicted_away_score ?? "",
  );
  const [selectedPlayer, setSelectedPlayer] = useState(
    players.find((p) => p.id === prediction?.predicted_scorer_id) ?? null,
  );
  const [saved, setSaved] = useState(false);
  const savedValuesRef = useRef({
    home: prediction?.predicted_home_score ?? null,
    away: prediction?.predicted_away_score ?? null,
    playerId: prediction?.predicted_scorer_id ?? null,
  });
  const { t } = useTranslation();

  const home = parseInt(homeScore);
  const away = parseInt(awayScore);
  const hasScores = !isNaN(home) && !isNaN(away);

  // Motivos por los que un jugador está desactivado
  const disabledReasons = new Map();

  // Motivo 1: el equipo del jugador no marcó en este partido
  if (hasScores) {
    players.forEach((player) => {
      if (player.team_id === match.home_team_id && home === 0) {
        disabledReasons.set(
          player.id,
          `${match.home_team?.name} no marcó en este partido`,
        );
      }
      if (player.team_id === match.away_team_id && away === 0) {
        disabledReasons.set(
          player.id,
          `${match.away_team?.name} no marcó en este partido`,
        );
      }
    });
  }

  // Motivo 2: el jugador ya fue elegido como goleador en otro partido
  const usedScorerIds = new Set(
    Object.entries(allPredictions)
      .filter(([mId]) => String(mId) !== String(match.id))
      .map(([, p]) => p.predicted_scorer_id)
      .filter(Boolean),
  );

  players.forEach((player) => {
    if (usedScorerIds.has(player.id) && !disabledReasons.has(player.id)) {
      disabledReasons.set(
        player.id,
        `Ya elegiste a ${player.name} como goleador en otro partido`,
      );
    }
  });

  // Si el jugador seleccionado está desactivado, lo ignoramos sin modificar el estado.
  // Cuando vuelva a estar disponible, la selección se restaura automáticamente.
  const effectivePlayer = selectedPlayer && !disabledReasons.has(selectedPlayer.id)
    ? selectedPlayer
    : null;

  // Auto-guardado con debounce: espera 800ms desde el último cambio antes de enviar
  useEffect(() => {
    if (!hasScores || !onSave) return;

    const prev = savedValuesRef.current;
    const playerId = selectedPlayer?.id ?? null;

    // Skip if nothing actually changed since last save
    if (prev.home === home && prev.away === away && prev.playerId === playerId) return;

    const timer = setTimeout(async () => {
      const effectiveId = selectedPlayer && !disabledReasons.has(selectedPlayer.id)
        ? selectedPlayer.id
        : null;
      const ok = await onSave(match.id, home, away, effectiveId);
      if (ok) {
        savedValuesRef.current = { home, away, playerId };
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [home, away, selectedPlayer]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleScoreChange(setter, teamId) {
    return (e) => {
      const val = e.target.value;
      setter(val);
      // Solo borra el goleador si su equipo pasa a 0 goles
      if (selectedPlayer && parseInt(val) === 0 && selectedPlayer.team_id === teamId) {
        setSelectedPlayer(null);
      }
    };
  }

  return (
    <div className="match-card">
      <div className="match-main-section">
        <div className="match-info-header">
          <span className="stage-badge">
            {t("match_group", { name: match.home_team?.group_name })}
          </span>
          <span className="match-date-text">
            {formatDate(match.match_date)}
          </span>
        </div>

        <div className="match-vs-container">
          <div className="team-row-item local">
            <span className="team-name-text">{match.home_team?.name}</span>
            <img
              src={match.home_team?.flag_url}
              alt={match.home_team?.name}
              className="team-flag-rounded"
            />
          </div>

          <div className="score-inputs-block">
            <input
              type="number"
              min="0"
              placeholder="-"
              value={homeScore}
              onChange={handleScoreChange(setHomeScore, match.home_team_id)}
              className="score-box"
            />
            <span className="score-divider-text">:</span>
            <input
              type="number"
              min="0"
              placeholder="-"
              value={awayScore}
              onChange={handleScoreChange(setAwayScore, match.away_team_id)}
              className="score-box"
            />
          </div>

          <div className="team-row-item visitante">
            <img
              src={match.away_team?.flag_url}
              alt={match.away_team?.name}
              className="team-flag-rounded"
            />
            <span className="team-name-text">{match.away_team?.name}</span>
          </div>
        </div>
      </div>

      <div className="match-prediction-section">
        <PlayerSelect
          players={players}
          selectedPlayer={effectivePlayer}
          onSelectPlayer={setSelectedPlayer}
          disabledReasons={disabledReasons}
          disabled={!hasScores}
        />
        {!hasScores && (
          <p className="scorer-hint">{t("match_score_hint")}</p>
        )}
        {saved && <p className="save-indicator">{t("match_saved")}</p>}
      </div>
    </div>
  );
}
