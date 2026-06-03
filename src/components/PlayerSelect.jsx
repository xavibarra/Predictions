import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./PlayerSelect.css";

const POSITIONS = [
  { id: "all", label: "Todas las posiciones" },
  { id: "portero", label: "Portero" },
  { id: "defensa", label: "Defensa" },
  { id: "centrocampista", label: "Centrocampista" },
  { id: "atacante", label: "Atacante" },
];

export default function PlayerSelect({
  players,
  selectedPlayer,
  onSelectPlayer,
  disabledReasons = new Map(),
  hidePositionFilter = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [disabledMsg, setDisabledMsg] = useState(null);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPlayers = players.filter((player) => {
    const query = search.toLowerCase();
    const matchesSearch =
      player.name.toLowerCase().includes(query) ||
      (player.team?.name && player.team.name.toLowerCase().includes(query)) ||
      (player.team_name && player.team_name.toLowerCase().includes(query));
    const matchesPosition =
      positionFilter === "all" || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  function handleDisabledClick(reason) {
    setDisabledMsg(reason);
    setTimeout(() => setDisabledMsg(null), 2500);
  }

  return (
    <div className="player-select-container" ref={dropdownRef}>
      <div
        className={`select-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedPlayer ? (
          <div className="selected-player-info">
            <img
              src={selectedPlayer.team?.flag_url}
              alt=""
              className="mini-flag"
            />
            <span className="player-name">{selectedPlayer.name}</span>
            <span className="player-team-context">
              ({selectedPlayer.team_name || selectedPlayer.position})
            </span>
          </div>
        ) : (
          <span className="placeholder">
            {t("player_search")}
          </span>
        )}
        <span className="arrow-icon">▼</span>
      </div>

      {isOpen && (
        <div className="select-dropdown">
          {disabledMsg && (
            <div className="disabled-toast">⚠ {disabledMsg}</div>
          )}

          <div className="dropdown-controls">
            <input
              type="text"
              placeholder="Ej: Lamine, España, Barça..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="search-input"
            />
            {!hidePositionFilter && (
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="position-dropdown"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <ul className="options-list">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => {
                const isDisabled = disabledReasons.has(player.id);
                return (
                  <li
                    key={player.id}
                    className={`option-item ${selectedPlayer?.id === player.id ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                    onClick={() => {
                      if (isDisabled) {
                        handleDisabledClick(disabledReasons.get(player.id));
                        return;
                      }
                      onSelectPlayer(player);
                      setIsOpen(false);
                    }}
                  >
                    <div className="player-row">
                      <img
                        src={player.team?.flag_url}
                        alt=""
                        className="mini-flag"
                      />
                      <div className="player-meta">
                        <span className="option-name">{player.name}</span>
                        <span className="option-subtext">
                          {player.team?.name}
                          {player.team_name && (
                            <> • {player.team_name}</>
                          )}
                        </span>
                      </div>
                      <span className="option-badge-pos">
                        {player.position.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="no-results">{t("player_no_results")}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
