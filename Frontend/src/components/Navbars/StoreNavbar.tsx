import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Collapse,
  Container,
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
} from "reactstrap";
import { useAuth } from "context/AuthContext";

function StoreNavbar() {
  const [navbarColor, setNavbarColor] = React.useState("navbar-transparent");
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const { user, logout, isAdmin } = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    const updateNavbarColor = () => {
      if (document.documentElement.scrollTop > 50 || document.body.scrollTop > 50) {
        setNavbarColor("");
      } else if (!collapseOpen) {
        setNavbarColor("navbar-transparent");
      }
    };

    window.addEventListener("scroll", updateNavbarColor);
    updateNavbarColor();
    return () => {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  }, [collapseOpen]);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      await logout();
    } finally {
      setSigningOut(false);
      setCollapseOpen(false);
    }
  };

  const displayName = user?.displayName || user?.email || "Tài khoản";

  return (
    <Navbar className={`navbar navbar-expand-lg fixed-top ${navbarColor}`} color="info">
      <Container>
        <div className="navbar-translate">
          <NavbarBrand tag={Link} to="/store" title="Source Market">
            App Bán Source Code
          </NavbarBrand>
          <button
            aria-expanded={collapseOpen}
            className="navbar-toggler"
            onClick={() => {
              document.documentElement.classList.toggle("nav-open");
              setCollapseOpen(!collapseOpen);
              if (!collapseOpen) {
                setNavbarColor("");
              }
            }}
          >
            <span className="navbar-toggler-bar top-bar"></span>
            <span className="navbar-toggler-bar middle-bar"></span>
            <span className="navbar-toggler-bar bottom-bar"></span>
          </button>
        </div>
        <Collapse isOpen={collapseOpen} navbar className="justify-content-end">
          <Nav navbar className="ml-auto">
            <NavItem>
              <NavLink tag={Link} to="/store" onClick={() => setCollapseOpen(false)}>
                Trang chủ
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/store/catalog" onClick={() => setCollapseOpen(false)}>
                Danh mục
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/store/cart" onClick={() => setCollapseOpen(false)}>
                Giỏ hàng
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/store/downloads" onClick={() => setCollapseOpen(false)}>
                Tải về
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/store/blog" onClick={() => setCollapseOpen(false)}>
                Blog
              </NavLink>
            </NavItem>
            {isAdmin && user?.emailVerified && (
              <NavItem>
                <NavLink tag={Link} to="/admin" onClick={() => setCollapseOpen(false)}>
                  Quản trị
                </NavLink>
              </NavItem>
            )}
            {user ? (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/store/profile" onClick={() => setCollapseOpen(false)}>
                    <i className="now-ui-icons users_circle-08 mr-1"></i>
                    {displayName}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <Button
                    color="info"
                    className="btn-round"
                    onClick={handleLogout}
                    disabled={signingOut}
                  >
                    {signingOut ? "Đang thoát..." : "Đăng xuất"}
                  </Button>
                </NavItem>
              </>
            ) : (
              <NavItem>
                <NavLink
                  tag={Link}
                  to="/store/auth"
                  className="btn btn-info btn-round"
                  onClick={() => setCollapseOpen(false)}
                >
                  Đăng nhập
                </NavLink>
              </NavItem>
            )}
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

export default StoreNavbar;
