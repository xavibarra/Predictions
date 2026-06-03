import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PlayerSelect from "../../../components/PlayerSelect";
import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../lib/supabaseClient";
import "./TournamentPicks.css";

const TEAM_PICK_KEYS = [
  { key: "champion_id", labelKey: "tournament_champion", icon: "🏆" },
  { key: "runner_up_id", labelKey: "tournament_runner_up", icon: "🥈" },
  { key: "third_id", labelKey: "tournament_third", icon: "🥉" },
  { key: "fourth_id", labelKey: "tournament_fourth", icon: "4º" },
];

const PLAYER_PICK_KEYS = [
  { key: "top_scorer_id", labelKey: "tournament_top_scorer", icon: "⚽", pos: null },
  { key: "best_player_id", labelKey: "tournament_best_player", icon: "🌟", pos: null },
  { key: "best_goalkeeper_id", labelKey: "tournament_best_gk", icon: "🧤", pos: "portero" },
];

const EMPTY = {
  champion_id: null, runner_up_id: null, third_id: null, fourth_id: null,
  top_scorer_id: null, best_player_id: null, best_goalkeeper_id: null,
};

export default function TournamentPicks() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [picks, setPicks] = useState(EMPTY);
  const [saved, setSaved] = useState(false);
  const savedRef = useRef({ ...EMPTY });
  const timerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [teamsRes, playersRes, picksRes] = await Promise.all([
        supabase.from("teams").select("id, name, flag_url").order("name"),
        supabase.from("players").select("*, team:teams(*)").order("name"),
        supabase.from("tournament_picks").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (teamsRes.data) setTeams(teamsRes.data);
      if (playersRes.data) setPlayers(playersRes.data);
      if (picksRes.data) {
        const loaded = {
          champion_id: picksRes.data.champion_id,
          runner_up_id: picksRes.data.runner_up_id,
          third_id: picksRes.data.third_id,
          fourth_id: picksRes.data.fourth_id,
          top_scorer_id: picksRes.data.top_scorer_id,
          best_player_id: picksRes.data.best_player_id,
          best_goalkeeper_id: picksRes.data.best_goalkeeper_id,
        };
        setPicks(loaded);
        savedRef.current = { ...loaded };
      }
    }
    load();
  }, [user]);

  function handleTeamChange(key, value) {
    const next = { ...picks, [key]: value ? Number(value) : null };
    setPicks(next);
    schedule(next);
  }

  function handlePlayerChange(key, player) {
    const next = { ...picks, [key]: player?.id ?? null };
    setPicks(next);
    schedule(next);
  }

  function schedule(next) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(next), 600);
  }

  async function doSave(next) {
    const { error } = await supabase
      .from("tournament_picks")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (!error) {
      savedRef.current = { ...next };
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function playerById(id) {
    return id ? (players.find((p) => p.id === id) ?? null) : null;
  }

  function teamById(id) {
    return id ? (teams.find((t) => t.id === id) ?? null) : null;
  }

  return (
    <div className="tp-card">
      <div className="tp-header">
        <span className="tp-title">{t("tournament_title")}</span>
        {saved && <span className="tp-saved">{t("tournament_saved")}</span>}
      </div>

      {/* Clasificación */}
      <div className="tp-section">
        <p className="tp-section-label">{t("tournament_classification")}</p>
        <div className="tp-team-grid">
          {TEAM_PICK_KEYS.map(({ key, labelKey, icon }) => {
            const selected = teamById(picks[key]);
            return (
              <div key={key} className="tp-pick">
                <label className="tp-pick-label">
                  <span className="tp-pick-icon">{icon}</span>
                  {t(labelKey)}
                </label>
                <div className="tp-select-wrap">
                  {selected?.flag_url && (
                    <img src={selected.flag_url} alt="" className="tp-select-flag" />
                  )}
                  <select
                    className={`tp-select ${selected ? "tp-select--has-flag" : ""}`}
                    value={picks[key] ?? ""}
                    onChange={(e) => handleTeamChange(key, e.target.value)}
                  >
                    <option value="">{t("tournament_select")}</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premios individuales */}
      <div className="tp-section">
        <p className="tp-section-label">{t("tournament_awards")}</p>
        <div className="tp-player-grid">
          {PLAYER_PICK_KEYS.map(({ key, labelKey, icon, pos }) => {
            const filtered = pos ? players.filter((p) => p.position === pos) : players;
            return (
              <div key={key} className="tp-pick">
                <label className="tp-pick-label">
                  <span className="tp-pick-icon">{icon}</span>
                  {t(labelKey)}
                </label>
                <PlayerSelect
                  players={filtered}
                  selectedPlayer={playerById(picks[key])}
                  onSelectPlayer={(p) => handlePlayerChange(key, p)}
                  disabledReasons={new Map()}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
