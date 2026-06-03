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
      const [matchesRes, playersRes, predsRes] = await Promise.all([
        supabase
          .from("matches")
          .select(
            "*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)",
          )
          .eq("phase", "group")
          .order("match_date"),
        supabase.from("players").select("*, team:teams(*)").order("name"),
        supabase
          .from("group_predictions")
          .select("*")
          .eq("user_id", user.id),
      ]);
      if (matchesRes.data) setMatches(matchesRes.data);
      if (playersRes.data) setPlayers(playersRes.data);
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
    // Actualización local inmediata para que usedScorerIds se propague a todas las cards
    setPredictions((prev) => ({ ...prev, [matchId]: newPred }));

    const { error } = await supabase
      .from("group_predictions")
      .upsert(newPred, { onConflict: "user_id,match_id" });
    return !error;
  }

  return { matches, loading, players, predictions, savePrediction };
}
