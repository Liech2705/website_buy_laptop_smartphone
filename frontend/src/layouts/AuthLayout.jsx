import { Outlet } from 'react-router-dom';

// AuthLayout: just a minimal passthrough wrapper for auth pages
// The actual login/register pages handle their own full-screen styling
const AuthLayout = () => {
  return <Outlet />;
};

export default AuthLayout;
