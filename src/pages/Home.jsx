import {
  IconBallFootball,
  IconCalendarEvent,
  IconLayoutGrid,
  IconPodium,
  IconTrophy,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabaseClient";
import "./Home.css";

const CLOSE_DATE = new Date("2026-06-11T17:00:00");

function daysUntil(date) {
  const diff = date - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    async function loadTeams() {
      const { data } = await supabase
        .from("teams")
        .select("*")
        .order("group_name");
      if (data) {
        const grouped = data.reduce((acc, team) => {
          if (!acc[team.group_name]) acc[team.group_name] = [];
          acc[team.group_name].push(team);
          return acc;
        }, {});
        setGroups(grouped);
      }
    }
    loadTeams();
  }, []);

  function handlePredict() {
    navigate(user ? "/predictions" : "/login");
  }

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        {!user && (
          <nav className="hero-nav">
            <div className="hero-logo">
              <div className="hero-logo-icon">
                <IconTrophy size={14} />
              </div>
              <span className="hero-logo-text">
                Predictions<strong>·26</strong>
              </span>
            </div>
            <div className="hero-nav-actions">
              {user ? (
                <button
                  className="hero-nav-link"
                  onClick={() => navigate("/predictions")}
                >
                  {t("home_my_predictions")}
                </button>
              ) : (
                <>
                  <button
                    className="hero-nav-link"
                    onClick={() => navigate("/login")}
                  >
                    {t("home_login")}
                  </button>
                  <button
                    className="hero-nav-cta"
                    onClick={() => navigate("/register")}
                  >
                    {t("home_register")}
                  </button>
                </>
              )}
            </div>
          </nav>
        )}

        <div className="hero-body">
          <div className="hero-eyebrow">
            <IconCalendarEvent size={12} />
            {t("home_eyebrow")}
          </div>
          <h1 className="hero-title">
            {t("home_title")}
          </h1>
          <p className="hero-sub">
            {t("home_subtitle")}
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={handlePredict}>
              <IconBallFootball size={16} />
              {t("home_predict_btn")}
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/leaderboard")}
            >
              <IconPodium size={16} />
              {t("home_ranking_btn")}
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-val">48</span>
            <span className="hero-stat-lbl">{t("home_stat_teams")}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">12</span>
            <span className="hero-stat-lbl">{t("home_stat_groups")}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">104</span>
            <span className="hero-stat-lbl">{t("home_stat_matches")}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">3</span>
            <span className="hero-stat-lbl">{t("home_stat_countries")}</span>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <IconCalendarEvent size={13} />
        <span>
          {t("home_deadline_label")} <strong>{t("home_deadline_date")}</strong>
        </span>
        <span className="ticker-pill">{daysUntil(CLOSE_DATE)} {t("home_days")}</span>
      </div>

      {/* GRUPOS */}
      <section className="groups-section">
        <div className="groups-header">
          <div className="groups-title">
            <IconLayoutGrid size={14} />
            {t("home_groups_title")}
          </div>
          <span className="groups-count">{t("home_groups_count")}</span>
        </div>

        {Object.keys(groups).length === 0 ? (
          <p className="groups-empty">{t("home_groups_loading")}</p>
        ) : (
          <div className="groups-grid">
            {Object.entries(groups).map(([groupName, teams]) => (
              <div key={groupName} className="group-card">
                <div className="group-card-header">{t("phase_group", { name: groupName })}</div>
                {teams.map((team) => (
                  <div key={team.id} className="group-team">
                    {team.flag_url && (
                      <img src={team.flag_url} alt={team.name} className="team-flag" />
                    )}
                    <span className="team-name">{team.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA FOOTER */}
      <div className="cta-footer">
        <div>
          <div className="cta-footer-title">{t("home_cta_title")}</div>
          <div className="cta-footer-sub">{t("home_cta_sub")}</div>
        </div>
        <button className="btn-primary" onClick={handlePredict}>
          <IconBallFootball size={15} />
          {user ? t("home_go_predict") : t("home_enter")}
        </button>
      </div>
    </div>
  );
}

export default Home;
