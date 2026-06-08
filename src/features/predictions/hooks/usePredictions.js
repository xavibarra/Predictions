import { useEffect, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { supabase } from "../../../lib/supabaseClient";

export function usePredictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!user) return;
    async function loadAll() {
      // 1. Fetch matches first to extract team IDs
      const matchesRes = await supabase
        .from("matches")
        .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
        .eq("phase", "group")
        .order("match_date");

      const loadedMatches = matchesRes.data ?? [];
      const teamIds = [...new Set(loadedMatches.flatMap((m) => [m.home_team_id, m.away_team_id]))];

      // 2. Fetch only players from those teams (paginated to bypass 1000-row server limit)
      const [p1, p2, predsRes] = await Promise.all([
        supabase.from("players").select("*, team:teams(*)").in("team_id", teamIds).order("name").range(0, 999),
        supabase.from("players").select("*, team:teams(*)").in("team_id", teamIds).order("name").range(1000, 1999),
        supabase.from("group_predictions").select("*").eq("user_id", user.id),
      ]);

      setMatches(loadedMatches);
      setPlayers([...(p1.data ?? []), ...(p2.data ?? [])]);
      if (predsRes.data) {
        const map = predsRes.data.reduce((acc, p) => {
          acc[p.match_id] = p;
          return acc;
        }, {});
        setPredictions(map);
      }
      setLoading(false);
    }
    loadAll();
  }, [user]);

  async function savePrediction(matchId, homeScore, awayScore, scorerId) {
    const newPred = {
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: homeScore,
      predicted_away_score: awayScore,
      predicted_scorer_id: scorerId,
    };
    setPredictions((prev) => ({ ...prev, [matchId]: newPred }));

    const { error } = await supabase
      .from("group_predictions")
      .upsert(newPred, { onConflict: "user_id,match_id" });
    return !error;
  }

  return { matches, loading, players, predictions, savePrediction };
}
