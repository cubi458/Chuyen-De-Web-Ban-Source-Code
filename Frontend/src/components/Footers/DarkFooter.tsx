/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container } from "reactstrap";

function DarkFooter() {
  return (
    <footer className="footer" data-background-color="black">
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
  );
}

export default DarkFooter;
