/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container } from "reactstrap";

// core components

function DefaultFooter() {
  return (
    <>
      <footer className="footer footer-default">
        <Container>
          <nav>
            <ul>
              <li>
                <a href="#/store">Trang chủ</a>
              </li>
              <li>
                <a href="#/store/catalog">Danh mục</a>
              </li>
              <li>
                <a href="#/store/blog">Blog</a>
              </li>
            </ul>
          </nav>
          <div className="copyright" id="copyright">
            © {new Date().getFullYear()} App Bán Source Code. All rights reserved.
          </div>
        </Container>
      </footer>
    </>
  );
}

export default DefaultFooter;
