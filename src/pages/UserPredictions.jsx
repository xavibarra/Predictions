import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function UserPredictions() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [predictions, setPredictions] = useState({});
  const [matches, setMatches] = useState([]);
  const [playersMap, setPlayersMap] = useState({});
  const { t } = useTranslation();

  function getPhaseLabel(match) {
    if (!match.phase || match.phase === "group") {
      return t("phase_group", { name: match.home_team?.group_name ?? "" });
    }
    return t(`phase_${match.phase}`, { defaultValue: match.phase.toUpperCase() });
  }

  useEffect(() => {
    async function load() {
      const [profileRes, predsRes, matchesRes, playersRes] = await Promise.all([
        supabase.from("profiles").select("username").eq("id", userId).single(),
        supabase.from("group_predictions").select("*").eq("user_id", userId),
        supabase.from("matches").select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)").eq("phase", "group").order("match_date"),
        supabase.from("players").select("id, name, team:teams(name, flag_url)"),
      ]);
      setUsername(profileRes.data?.username ?? "Usuario");
      if (predsRes.data) {
        const map = predsRes.data.reduce((acc, p) => { acc[p.match_id] = p; return acc; }, {});
        setPredictions(map);
      }
      if (matchesRes.data) setMatches(matchesRes.data);
      if (playersRes.data) {
        const pMap = playersRes.data.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
        setPlayersMap(pMap);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <p style={{ padding: "24px" }}>{t("user_preds_loading")}</p>;

  // Group matches by group_name
  const groups = matches.reduce((acc, match) => {
    const g = match.home_team?.group_name ?? "?";
    if (!acc[g]) acc[g] = [];
    acc[g].push(match);
    return acc;
  }, {});

  const predCount = Object.keys(predictions).length;

  return (
    <div style={{ padding: "24px 0", maxWidth: 800, width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ marginBottom: 4 }}>{t("user_preds_of", { username })}</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: "0.9rem" }}>
        {t(predCount === 1 ? "user_preds_count_one" : "user_preds_count_other", { count: predCount })} · {t("user_preds_read_only")}
      </p>

      {Object.entries(groups).map(([groupName, groupMatches]) => (
        <div key={groupName} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: 10 }}>
            {t("phase_group", { name: groupName })}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {groupMatches.map(match => {
              const pred = predictions[match.id];
              const scorer = pred?.predicted_scorer_id ? playersMap[pred.predicted_scorer_id] : null;
              return (
                <div key={match.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: 0.5 }}>{getPhaseLabel(match)}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{formatDate(match.match_date)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-h)" }}>{match.home_team?.name}</span>
                      <img src={match.home_team?.flag_url} alt="" style={{ width: 36, height: 24, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {pred ? (
                        <>
                          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", minWidth: 24, textAlign: "center" }}>{pred.predicted_home_score}</span>
                          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--muted)" }}>:</span>
                          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", minWidth: 24, textAlign: "center" }}>{pred.predicted_away_score}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--muted)", letterSpacing: 1 }}>— : —</span>
                      )}
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={match.away_team?.flag_url} alt="" style={{ width: 36, height: 24, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)" }} />
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-h)" }}>{match.away_team?.name}</span>
                    </div>
                  </div>
                  {pred ? (
                    scorer ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                        <span>⚽</span>
                        {scorer.team?.flag_url && <img src={scorer.team.flag_url} alt="" style={{ width: 16, height: 11, objectFit: "cover", borderRadius: 2, border: "1px solid var(--border)" }} />}
                        <span style={{ fontWeight: 600, color: "var(--text-h)" }}>{scorer.name}</span>
                      </div>
                    ) : (
                      <p style={{ fontSize: "0.78rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>{t("user_preds_no_scorer")}</p>
                    )
                  ) : (
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 8 }}>{t("user_preds_no_prediction")}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserPredictions;
