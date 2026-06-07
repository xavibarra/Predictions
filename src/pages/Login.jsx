import { IconTrophy } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <IconTrophy size={16} />
          </div>
          <span className="auth-logo-text">
            Predictions <strong>· 26</strong>
          </span>
        </div>

        <h1 className="auth-title">{t("auth_login_title")}</h1>
        <p className="auth-sub">{t("auth_login_sub")}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">{t("auth_email")}</label>
            <input
              className="auth-input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t("auth_password")}</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? t("auth_logging_in") : t("auth_login_btn")}
          </button>
        </form>

        <p className="auth-footer">
          {t("auth_no_account")}{" "}
          <Link to="/register">{t("auth_register_link")}</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
