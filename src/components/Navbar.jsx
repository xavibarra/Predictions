import { IconLogout, IconMenu2, IconTrophy, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabaseClient";
import "./Navbar.css";

const LANGS = ["CA", "ES", "EN"];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, user } = useAuth();
  const isAdmin = profile?.is_admin;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  function closeMenu() {
    setMenuOpen(false);
  }

  function changeLang(lang) {
    const l = lang.toLowerCase();
    i18n.changeLanguage(l);
    localStorage.setItem("lang", l);
  }

  function LangSelector() {
    return (
      <div className="nav-lang">
        {LANGS.map((lang) => (
          <button
            key={lang}
            className={`nav-lang-btn ${i18n.language === lang.toLowerCase() ? "active" : ""}`}
            onClick={() => changeLang(lang)}
          >
            {lang}
          </button>
        ))}
      </div>
    );
  }

  return (
    <nav className="navbar">
      {/* Logo — lleva a home */}
      <Link to="/" className="nav-logo" onClick={closeMenu}>
        <span className="nav-logo-icon"><IconTrophy size={14} /></span>
        <span className="nav-logo-text">
          Predictions <strong>· 26</strong>
        </span>
      </Link>

      {/* Links desktop */}
      <div className="nav-links">
        <Link to="/partidos">{t("nav_matches")}</Link>
        <Link to="/leaderboard">{t("nav_ranking")}</Link>
        <Link to="/puntuacion">{t("nav_scoring")}</Link>
        {isAdmin && <Link to="/admin">{t("nav_admin")}</Link>}
      </div>

      {/* Acciones desktop */}
      <div className="nav-actions">
        <LangSelector />
        <Link to="/predictions" className="nav-cta">{t("nav_predict")}</Link>
        {user && (
          <button className="nav-logout" onClick={handleLogout} title={t("nav_signout_long")}>
            <IconLogout size={16} />
            <span>{t("nav_signout")}</span>
          </button>
        )}
      </div>

      {/* Burger móvil */}
      <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
        {menuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
      </button>

      {/* Panel móvil */}
      {menuOpen && (
        <>
          <div className="nav-overlay" onClick={closeMenu} />
          <div className="nav-panel">
            <div className="nav-panel-links">
              <Link to="/partidos" onClick={closeMenu}>{t("nav_matches")}</Link>
              <Link to="/leaderboard" onClick={closeMenu}>{t("nav_ranking")}</Link>
              <Link to="/puntuacion" onClick={closeMenu}>{t("nav_scoring")}</Link>
              {isAdmin && <Link to="/admin" onClick={closeMenu}>{t("nav_admin")}</Link>}
            </div>
            <div className="nav-panel-footer">
              <LangSelector />
              <Link to="/predictions" className="nav-cta nav-cta--full" onClick={closeMenu}>
                {t("nav_predict")}
              </Link>
              {user && (
                <button className="nav-logout nav-logout--panel" onClick={() => { handleLogout(); closeMenu(); }}>
                  <IconLogout size={15} />
                  {t("nav_signout_long")}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
