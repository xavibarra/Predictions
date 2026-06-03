import { useTranslation } from "react-i18next";
import "./Puntuacion.css";

function Puntuacion() {
  const { t } = useTranslation();

  return (
    <div className="pun-page">
      <h1>{t("scoring_title")}</h1>

      {/* ── PARTIDOS ── */}
      <section className="pun-section">
        <h2 className="pun-section-title">{t("scoring_group_title")}</h2>

        <div className="pun-rules">
          <div className="pun-row">
            <span className="pun-pts">1<span>pt</span></span>
            <div className="pun-text">
              <strong>{t("scoring_sign")}</strong>
              <span>{t("scoring_sign_desc")}</span>
            </div>
          </div>

          <div className="pun-row">
            <span className="pun-pts pun-pts--bonus">+2<span>pts</span></span>
            <div className="pun-text">
              <strong>{t("scoring_exact")}</strong>
              <span>{t("scoring_exact_desc")}</span>
            </div>
          </div>

          <div className="pun-row">
            <span className="pun-pts">1<span>pt/gol</span></span>
            <div className="pun-text">
              <strong>{t("scoring_scorer")}</strong>
              <span>{t("scoring_scorer_desc")}</span>
            </div>
          </div>
        </div>

        <ul className="pun-notes">
          <li>{t("scoring_note1")}</li>
          <li>{t("scoring_note2")}</li>
        </ul>
      </section>

      <div className="pun-bottom-grid">
        {/* ── CLASIFICACIÓN FINAL ── */}
        <section className="pun-section">
          <h2 className="pun-section-title">{t("scoring_tournament_title")}</h2>

          <div className="pun-clasif-card">
            <div className="pun-clasif-row">
              <span className="pun-clasif-pts">10 pts</span>
              <div className="pun-text">
                <strong>{t("scoring_exact_pos")}</strong>
                <span>{t("scoring_exact_pos_desc")}</span>
              </div>
            </div>
            <div className="pun-clasif-divider" />
            <div className="pun-clasif-row">
              <span className="pun-clasif-pts pun-clasif-pts--secondary">5 pts</span>
              <div className="pun-text">
                <strong>{t("scoring_wrong_pos")}</strong>
                <span>{t("scoring_wrong_pos_desc")}</span>
              </div>
            </div>
            <p className="pun-clasif-example">
              <strong>{t("scoring_example")}</strong> {t("scoring_wrong_pos_example")}
            </p>
          </div>
        </section>

        {/* ── PREMIOS ── */}
        <section className="pun-section">
          <h2 className="pun-section-title">{t("scoring_awards_title")}</h2>

          <div className="pun-rules">
            <div className="pun-row">
              <span className="pun-pts">10<span>pts</span></span>
              <div className="pun-text">
                <strong>{t("scoring_top_scorer_title")}</strong>
                <span>{t("scoring_top_scorer_desc")}</span>
              </div>
            </div>

            <div className="pun-row">
              <span className="pun-pts">5<span>pts</span></span>
              <div className="pun-text">
                <strong>{t("scoring_best_player_title")}</strong>
                <span>{t("scoring_best_player_desc")}</span>
              </div>
            </div>

            <div className="pun-row">
              <span className="pun-pts">5<span>pts</span></span>
              <div className="pun-text">
                <strong>{t("scoring_best_gk_title")}</strong>
                <span>{t("scoring_best_gk_desc")}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Puntuacion;
