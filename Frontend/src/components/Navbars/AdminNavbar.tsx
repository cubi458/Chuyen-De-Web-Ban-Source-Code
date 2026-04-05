import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container,
} from "reactstrap";
import { useAuth } from "context/AuthContext";

function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      setSigningOut(true);
      await logout();
      navigate("/store/auth", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Navbar className="navbar navbar-expand-lg" color="dark" dark expand="lg">
      <Container>
        <NavbarBrand tag={Link} to="/admin">
          Quản trị - App Bán Source Code
        </NavbarBrand>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink tag={Link} to="/admin">
              Dashboard
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/store/downloads">
              Download queue
            </NavLink>
              <NavLink
                href="#logout"
                onClick={handleLogout}
                className={signingOut ? "disabled" : ""}
              >
                {signingOut ? "Đang thoát..." : "Logout"}
              </NavLink>
          </NavItem>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AdminNavbar;
