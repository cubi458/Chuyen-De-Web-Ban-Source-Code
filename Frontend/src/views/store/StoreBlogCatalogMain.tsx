import React from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";
import { storeBlogPosts } from "views/store/data/storeBlogPosts";

function StoreBlogCatalogMain() {
  return (
    <>
      <Row className="align-items-start">
        <Col lg="8">
          <div className="mb-4">
            <h2 className="title mb-2">Về chúng tôi</h2>
            <p className="mb-0 font-weight-bold">
                Được thành lập từ năm 2021, chúng tôi chuyên cung cấp các mã nguồn có sẵn phục vụ cho
                việc xây dựng website và ứng dụng web. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng
                cao, dễ dàng tùy chỉnh và tích hợp
            </p>
          </div>
          {/* Google Maps  */}
          <div className="mb-4">
            <div
              style={{
                position: "relative",
                paddingBottom: "42%",
                height: 0,
                overflow: "hidden",
                width: "100%",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.2145255159858!2d106.78918677583908!3d10.871281657435308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276398969f7b%3A0x9672b7efd0893fc4!2sTr%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20N%C3%B4ng%20L%C3%A2m%20TP.%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1718446733206!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0, position: "absolute", top: 0, left: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Trường Đại học Nông Lâm TP.HCM map"
              />
            </div>
            <div className="mt-2">
              <Button
                color="default"
                size="sm"
                className="btn-round"
                tag="a"
                href="https://www.google.com/maps/place/Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+N%C3%B4ng+L%C3%A2m+TP.+H%E1%BB%93+Ch%C3%AD+Minh/@10.8712817,106.7891868,685m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3175276398969f7b:0x9672b7efd0893fc4!8m2!3d10.8712764!4d106.7917617!16s%2Fm%2F02q4yqq?hl=vi-VN&entry=ttu"
                target="_blank"
                rel="noreferrer"
              >
                Mở bản đồ trong Google Maps
              </Button>
            </div>
          </div>

          <Card className="mb-4">
            <CardBody>
              <h3 className="mb-3">Tin tức mới</h3>
              {storeBlogPosts.map((post) => (
                <Card className="border mb-3" key={post.id}>
                  <Row className="no-gutters">
                    {post.coverImage && (
                      <Col md="5" style={{ position: "relative" }}>
                        <Link
                          to={`/store/blog/${post.id}`}
                          style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "100%",
                            padding: "0 15px",
                          }}
                        >
                          <img
                            alt={post.title}
                            className="card-img"
                            src={post.coverImage}
                            style={{ height: "60%", objectFit: "cover" }}
                          />
                        </Link>
                      </Col>
                    )}
                    <Col md={post.coverImage ? "7" : "12"}>
                      <CardBody>
                        <h4 className="mb-1">
                          <Link to={`/store/blog/${post.id}`}>{post.title}</Link>
                        </h4>
                        <small className="text-muted">
                          {post.dateLabel} • {post.readTimeLabel}
                        </small>
                        <p className="description mt-2 mb-2">{post.summary}</p>
                        <div>
                          {post.tags.map((tag) => (
                            <Badge color="default" className="mr-1" key={`${post.id}-${tag}`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3">
                          <Button
                            color="info"
                            size="sm"
                            className="btn-round"
                            tag={Link}
                            to={`/store/blog/${post.id}`}
                          >
                            Xem thêm
                          </Button>
                        </div>
                      </CardBody>
                    </Col>
                  </Row>
                </Card>
              ))}
            </CardBody>
          </Card>
        </Col>

        <Col lg="4">


          <Card className="mb-4">
            <CardBody>
              <h4 className="mb-3">Chính sách & Cam kết</h4>
              <div className="mb-3">
                <p className="mb-1 d-flex align-items-center">
                  <strong>Chất lượng</strong>
                </p>
                <small className="text-muted">
                  Cung cấp sản phẩm chất lượng, uy tín
                </small>
              </div>
              <div className="mb-3">
                <p className="mb-1 d-flex align-items-center">
                  <strong>Bảo hành</strong>
                </p>
                <small className="text-muted">
                  Hỗ trợ khách hàng khắc phục lỗi và các vấn đề phát sinh
                </small>
              </div>
              <div className="mb-0">
                <p className="mb-1 d-flex align-items-center">
                  <strong>Hoàn tiền</strong>
                </p>
                <small className="text-muted">
                  Cam kết hoàn tiền trong 7 ngày nếu sản phẩm không đúng mô tả
                </small>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="mb-2">Sản phẩm</h4>
              <p className="description mb-3">
                Chúng tôi có nhiều sản phẩm đang chờ bạn khám phá, hãy ghé thăm cửa hàng để xem thêm
              </p>
              <Button color="info" className="btn-round btn-block" tag={Link} to="/store">
                Xem thêm sản phẩm
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default StoreBlogCatalogMain;

