import { Outlet, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Partidos from "./pages/Partidos";
import Predictions from "./pages/Predictions";
import Puntuacion from "./pages/Puntuacion";
import Register from "./pages/Register";
import UserPredictions from "./pages/UserPredictions";

function PublicLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Layout /> : <Outlet />;
}
function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Públicas — sin layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Requieren login — con layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/puntuacion" element={<Puntuacion />} />
          <Route path="/predictions/:userId" element={<UserPredictions />} />
        </Route>
      </Route>

      {/* Solo admin — con layout */}
      <Route element={<AdminRoute />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
