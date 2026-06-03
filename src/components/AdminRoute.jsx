import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  if (!user || !profile.is_admin) return <Navigate to="/" />;
  return <Outlet />;
}

export default AdminRoute;
