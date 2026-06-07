import { IconTrophy } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Auth.css";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
    } else {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: username,
      });
      setLoading(false);
      navigate("/");
    }
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

        <h1 className="auth-title">{t("auth_register_title")}</h1>
        <p className="auth-sub">{t("auth_register_sub")}</p>

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
            <label className="auth-label">{t("auth_username")}</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Tu nombre en el ranking"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            {loading ? t("auth_creating") : t("auth_register_btn")}
          </button>
        </form>

        <p className="auth-footer">
          {t("auth_has_account")}{" "}
          <Link to="/login">{t("auth_login_link")}</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
