/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container } from "reactstrap";
// core components

function IndexHeader() {
  const pageHeader = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (window.innerWidth <= 991) {
      return undefined;
    }

    const updateScroll = () => {
      if (!pageHeader.current) {
        return;
      }
      const windowScrollTop = window.pageYOffset / 3;
      pageHeader.current.style.transform =
        "translate3d(0," + windowScrollTop + "px,0)";
    };

    window.addEventListener("scroll", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <>
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/header.jpg") + ")"
          }}
          ref={pageHeader}
        ></div>
        <Container>
          <div className="content-center brand">
            <img
              alt="..."
              className="n-logo"
              src={require("assets/img/now-logo.png")}
            ></img>
            <h1 className="h1-seo">App Bán Source Code</h1>
            <h3>Mua bán source code chất lượng cho dev & agency.</h3>
          </div>
          <h6 className="category category-absolute">
            Duyệt danh mục, thêm vào giỏ, thanh toán và tải về.
          </h6>
        </Container>
      </div>
    </>
  );
}

export default IndexHeader;
