import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import ReviewSection from "components/Reviews/ReviewSection";
import { sourceProducts } from "data/sourceCatalog";
import { useCart } from "context/CartContext";

function SourceDetailPage() {
  const { sourceId } = useParams();
  const product = React.useMemo(() => {
    return sourceProducts.find((item) => item.id === sourceId) ?? sourceProducts[0];
  }, [sourceId]);
  const { addToCart } = useCart();
  const [feedback, setFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return () => {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  React.useEffect(() => {
    if (!feedback) {
      return;
    }
    const timeout = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  if (!product) {
    return null;
  }

  const handleAddToCart = async () => {
    const result = await addToCart(product.id);
    setFeedback(result.message);
  };

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="page-header page-header-small">
          <div
            className="page-header-image"
            style={{
              backgroundImage: `url(${product.coverImage})`,
              filter: "brightness(0.4)",
            }}
          ></div>
          <div className="content-center">
            <Container>
              <Row className="align-items-center">
                <Col md="8">
                  <h1 className="title text-white">{product.title}</h1>
                  <p className="text-white mb-3">{product.summary}</p>
                  <div className="mb-3">
                    {product.technologies.map((tech) => (
                      <Badge color="default" className="mr-1" key={tech}>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-warning h3 mb-0">${product.price}</div>
                </Col>
                <Col md="4" className="text-md-right text-center">
                  <Button color="info" size="lg" className="mr-2">
                    Mua ngay
                  </Button>
                  <Button color="neutral" outline size="lg" tag={Link} to="/store/catalog">
                    Trở lại danh mục
                  </Button>
                  <div className="mt-3">
                    <Button color="primary" onClick={handleAddToCart}>
                      + Thêm sản phẩm
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </div>

        <div className="section">
          <Container>
            {feedback && (
              <Alert
                color="success"
                toggle={() => setFeedback(null)}
                className="sticky-feedback"
              >
                {feedback}
              </Alert>
            )}
            <Row>
              <Col lg="8">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Demo</h4>
                  </CardHeader>
                  <CardBody>
                    {product.videoUrl ? (
                      <div className="embed-responsive embed-responsive-16by9">
                        <iframe
                          title="product-demo"
                          className="embed-responsive-item"
                          src={product.videoUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <img
                        alt={product.title}
                        src={product.coverImage}
                        className="img-raised rounded img-fluid"
                      />
                    )}
                  </CardBody>
                </Card>

                {product.detailImages.length > 0 && (
                  <Card className="mb-4">
                    <CardHeader>
                      <h4 className="mb-0">Thư viện hình ảnh</h4>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        {product.detailImages.map((image, index) => (
                          <Col md="4" sm="6" xs="12" className="mb-3" key={`${product.id}-detail-${index}`}>
                            <div className="rounded overflow-hidden border detail-preview-thumb">
                              <img
                                src={image}
                                alt={`${product.title} preview ${index + 1}`}
                                className="img-fluid"
                                style={{ width: "100%", objectFit: "cover", height: 160 }}
                              />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </CardBody>
                  </Card>
                )}

                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Mô tả & tính năng</h4>
                  </CardHeader>
                  <CardBody>
                    <p>{product.summary}</p>
                    <ListGroup>
                      {product.readmeHighlights.map((item) => (
                        <ListGroupItem key={item} className="border-0 px-0 pb-0">
                          <i className="now-ui-icons ui-1_check mr-2 text-success"></i>
                          {item}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h4 className="mb-0">README / Tài liệu</h4>
                  </CardHeader>
                  <CardBody>
                    <p>
                      Bộ README đi kèm hướng dẫn cài đặt, cấu trúc thư mục, checklist
                      deploy và các đoạn mã mẫu tích hợp thanh toán, auth, logging...
                    </p>
                    <Button color="primary" className="mr-2">
                      Tải README
                    </Button>
                    <Button color="default" outline>
                      Xem thử trích đoạn
                    </Button>
                  </CardBody>
                </Card>
              </Col>

              <Col lg="4">
                <Card className="mb-4">
                  <CardHeader>
                    <h5 className="mb-0">Thông tin nhanh</h5>
                  </CardHeader>
                  <CardBody>
                    <ListGroup flush>
                      <ListGroupItem>
                        <strong>Ngôn ngữ:</strong>
                        <div>{product.languages.join(", ")}</div>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Loại dự án:</strong>
                        <div>{product.projectType}</div>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Mức độ:</strong>
                        <div className="text-capitalize">{product.level}</div>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Tech stack chính:</strong>
                        <div>
                          {product.technologies.map((tech) => (
                            <Badge color="info" className="mr-1" key={`stack-${tech}`}>
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </ListGroupItem>
                    </ListGroup>
                  </CardBody>
                </Card>

                <Card className="mb-4">
                  <CardHeader>
                    <h5 className="mb-0">Bao gồm những gì?</h5>
                  </CardHeader>
                  <CardBody>
                    <ListGroup>
                      {product.includes.map((item) => (
                        <ListGroupItem key={`include-${item}`} className="border-0 px-0">
                          <i className="now-ui-icons travel_info mr-2 text-info"></i>
                          {item}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h5 className="mb-0">Deliverables</h5>
                  </CardHeader>
                  <CardBody>
                    <ListGroup>
                      {product.deliverables.map((item) => (
                        <ListGroupItem key={`deliver-${item}`} className="border-0 px-0">
                          <i className="now-ui-icons files_single-copy-04 mr-2 text-success"></i>
                          {item}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Reviews Section */}
            <Row className="mt-4">
              <Col lg="8">
                <ReviewSection productId={product.id} />
              </Col>
            </Row>
          </Container>
        </div>
        <StoreFooter />
      </div>
    </>
  );
}

export default SourceDetailPage;
