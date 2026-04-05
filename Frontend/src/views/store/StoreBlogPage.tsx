import React from "react";
import { Container } from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import StoreBlogCatalogMain from "views/store/StoreBlogCatalogMain";

function StoreBlogPage() {
  React.useEffect(() => {
    document.body.classList.add("landing-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return () => {
      document.body.classList.remove("landing-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="page-header page-header-small">
          <div
            className="page-header-image"
            style={{ backgroundImage: "url(" + require("assets/img/bg8.jpg") + ")" }}
          ></div>
          <div className="content-center">
            <Container fluid classNam
                       e="catalog-container">
              <h1 className="title">Blog</h1>
            </Container>
          </div>
        </div>

        <div className="section section-basic">
          <Container fluid className="catalog-container">
            <StoreBlogCatalogMain />
          </Container>
        </div>

        <StoreFooter />
      </div>
    </>
  );
}

export default StoreBlogPage;

