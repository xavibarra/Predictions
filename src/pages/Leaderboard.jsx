import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabaseClient";
import "./Leaderboard.css";

const MEDALS = ["🥇", "🥈", "🥉"];

function Leaderboard() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const myRowRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) {
        setError(t("ranking_error"));
      } else {
        setRanking(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [t]);

  // Hacer scroll hasta la fila del usuario cuando carga
  useEffect(() => {
    if (!loading && myRowRef.current) {
      myRowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [loading]);

  if (loading) {
    return <p className="lb-status">{t("ranking_loading")}</p>;
  }

  if (error) {
    return <p className="lb-status lb-error">{error}</p>;
  }

  return (
    <div className="leaderboard-page">
      <h1>{t("ranking_title")}</h1>
      <p className="lb-subtitle">{t("ranking_subtitle")}</p>

      {ranking.length === 0 ? (
        <p className="lb-empty">
          {t("ranking_empty")}
        </p>
      ) : (
        <div className="lb-list">
          {ranking.map((entry, index) => {
            const position = index + 1;
            const isMe = entry.user_id === user?.id;
            const isMedal = position <= 3;

            return (
              <div
                key={entry.user_id}
                ref={isMe ? myRowRef : null}
                className={[
                  "lb-row",
                  isMedal ? `lb-medal-${position}` : "",
                  isMe ? "lb-me" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  isMe
                    ? navigate("/predictions")
                    : navigate(`/predictions/${entry.user_id}`)
                }
                style={isMe ? undefined : { cursor: "pointer" }}
              >
                <span className="lb-pos">
                  {isMedal ? MEDALS[index] : position}
                </span>

                <span className="lb-name">
                  {entry.username}
                  {isMe && <span className="lb-you">{t("ranking_you")}</span>}
                </span>

                <span className="lb-pts">{entry.points}</span>
                <span className="lb-pts-label">{t("ranking_pts")}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
