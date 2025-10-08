import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
      return;
    }
    navigate("/", { replace: true });
  }, [navigate, location.pathname]);

  if (location.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
    return <div style={{ display: 'none' }} />;
  }

  return null;
}