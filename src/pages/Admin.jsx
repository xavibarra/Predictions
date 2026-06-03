import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminMatchCard from "../components/AdminMatchCard";
import { supabase } from "../lib/supabaseClient";

function Admin() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState({});
  const [players, setPlayers] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      const [matchesRes, playersRes, scorersRes] = await Promise.all([
        supabase
          .from("matches")
          .select(
            "*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)",
          )
          .order("match_date"),
        supabase
          .from("players")
          .select("*, team:teams(*)")
          .order("name"),
        supabase
          .from("match_scorers")
          .select("match_id, player_id, goals"),
      ]);

      const matches = matchesRes.data ?? [];
      const allPlayers = playersRes.data ?? [];
      const scorers = scorersRes.data ?? [];

      // Índice de goleadores por partido: { matchId: [{ player_id, goals }] }
      const scorersByMatch = scorers.reduce((acc, s) => {
        if (!acc[s.match_id]) acc[s.match_id] = [];
        acc[s.match_id].push({ player_id: s.player_id, goals: s.goals });
        return acc;
      }, {});

      // Agrupar partidos por grupo
      const grouped = matches.reduce((acc, match) => {
        const g = match.home_team?.group_name ?? "Sin grupo";
        if (!acc[g]) acc[g] = [];
        acc[g].push({
          match,
          existingScorers: scorersByMatch[match.id] ?? [],
        });
        return acc;
      }, {});

      setPlayers(allPlayers);
      setGroups(grouped);
      setLoading(false);
    }
    load();
  }, []);

  async function saveResult(matchId, homeScore, awayScore, scorers) {
    // 1. Actualizar resultado en matches
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: "finished",
      })
      .eq("id", matchId);

    if (matchError) return false;

    // 2. Borrar goleadores anteriores (permite corregir errores)
    await supabase.from("match_scorers").delete().eq("match_id", matchId);

    // 3. Insertar los nuevos goleadores
    if (scorers.length > 0) {
      const { error: scorersError } = await supabase
        .from("match_scorers")
        .insert(
          scorers.map((s) => ({
            match_id: matchId,
            player_id: s.playerId,
            goals: s.goals,
          })),
        );
      if (scorersError) return false;
    }

    return true;
  }

  if (loading) {
    return <p style={{ padding: "24px" }}>{t("admin_loading")}</p>;
  }

  return (
    <div style={{ padding: "24px 0", width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ marginBottom: "6px" }}>{t("admin_title")}</h1>
      <p style={{ color: "var(--muted)", marginBottom: "28px", fontSize: "0.95rem" }}>
        {t("admin_subtitle")}
      </p>

      {Object.entries(groups).map(([groupName, items]) => (
        <div key={groupName} style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "var(--muted)",
              marginBottom: "12px",
            }}
          >
            {t("match_group", { name: groupName })}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map(({ match, existingScorers }) => (
              <AdminMatchCard
                key={match.id}
                match={match}
                players={players.filter(
                  (p) =>
                    p.team_id === match.home_team_id ||
                    p.team_id === match.away_team_id,
                )}
                existingScorers={existingScorers}
                onSave={saveResult}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Admin;
