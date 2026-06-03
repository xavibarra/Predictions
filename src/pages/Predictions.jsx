import { useTranslation } from "react-i18next";
import GroupStage from "../components/GroupStage";
import TournamentPicks from "../features/predictions/components/TournamentPicks";
import { usePredictions } from "../features/predictions/hooks/usePredictions";

function Predictions() {
  const { matches, players, predictions, loading, savePrediction } =
    usePredictions();
  const { t } = useTranslation();

  if (loading) return <p style={{ padding: "24px" }}>{t("predictions_loading")}</p>;

  return (
    <div style={{ padding: "24px 0", width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ marginBottom: 6 }}>{t("predictions_title")}</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: "0.9rem" }}>
        {t("predictions_subtitle", { count: matches.length })}
      </p>

      <TournamentPicks />

      <div style={{ marginTop: 24 }}>
        <p style={{
          fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.5px", color: "var(--muted)", marginBottom: 14,
        }}>
          {t("predictions_group_phase")}
        </p>
        <GroupStage
          matches={matches}
          players={players}
          predictions={predictions}
          onSave={savePrediction}
        />
      </div>
    </div>
  );
}

export default Predictions;
