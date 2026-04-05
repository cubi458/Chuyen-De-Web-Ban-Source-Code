import React from "react";

// reactstrap components
import { Button, Container, Row, Col, UncontrolledTooltip } from "reactstrap";

// core components

function Download() {
  return (
    <>
      <div
        className="section section-download"
        data-background-color="black"
        id="download-section"
      >
        <Container>
          <Row className="justify-content-md-center">
            <Col className="text-center" lg="8" md="12">
              <h3 className="title">Khám phá kho source code</h3>
              <h5 className="description">
                Duyệt danh mục, xem chi tiết, thêm vào giỏ, thanh toán và tải về
                ngay trong App Bán Source Code.
              </h5>
            </Col>
            <Col className="text-center" lg="8" md="12">
              <Button
                className="btn-round mr-1"
                color="info"
                href="#/store/catalog"
                role="button"
                size="lg"
              >
                Xem danh mục
              </Button>
              <Button
                className="btn-round"
                color="primary"
                href="#/store/auth"
                outline
                role="button"
                size="lg"
              >
                Đăng nhập / Đăng ký
              </Button>
            </Col>
          </Row>
          <br></br>
          <br></br>
          <br></br>
          <Row className="text-center mt-5">
            <Col className="ml-auto mr-auto" md="8">
              <h2>Bắt đầu ngay</h2>
              <h5 className="description">
                Truy cập cửa hàng để xem các gói source theo nhu cầu (web,
                mobile, admin, landing page...).
              </h5>
            </Col>
            <Col md="12">
              <Button
                className="btn-neutral btn-round"
                color="default"
                href="#/store"
                size="lg"
              >
                <i className="now-ui-icons arrows-1_share-66 mr-1"></i>
                Vào cửa hàng
              </Button>
            </Col>
          </Row>
          <br></br>
          <br></br>
          <Row className="justify-content-md-center sharing-area text-center">
            <Col className="text-center" lg="8" md="12">
              <h3>Cảm ơn bạn đã ghé thăm!</h3>
            </Col>
            <Col className="text-center" lg="8" md="12">
              <Button
                className="btn-neutral btn-icon btn-round"
                color="twitter"
                href="#/store"
                id="tooltip86114138"
                size="lg"
              >
                <i className="fab fa-twitter"></i>
              </Button>
              <UncontrolledTooltip delay={0} target="tooltip86114138">
                Theo dõi
              </UncontrolledTooltip>
              <Button
                className="btn-neutral btn-icon btn-round"
                color="facebook"
                href="#/store"
                id="tooltip735272548"
                size="lg"
              >
                <i className="fab fa-facebook-square"></i>
              </Button>
              <UncontrolledTooltip delay={0} target="tooltip735272548">
                Like
              </UncontrolledTooltip>
              <Button
                className="btn-neutral btn-icon btn-round"
                color="linkedin"
                href="#/store"
                id="tooltip647117716"
                size="lg"
              >
                <i className="fab fa-linkedin"></i>
              </Button>
              <UncontrolledTooltip delay={0} target="tooltip647117716">
                Kết nối
              </UncontrolledTooltip>
              <Button
                className="btn-neutral btn-icon btn-round"
                color="github"
                href="#/store"
                id="tooltip331904895"
                size="lg"
              >
                <i className="fab fa-github"></i>
              </Button>
              <UncontrolledTooltip delay={0} target="tooltip331904895">
                Github
              </UncontrolledTooltip>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default Download;
