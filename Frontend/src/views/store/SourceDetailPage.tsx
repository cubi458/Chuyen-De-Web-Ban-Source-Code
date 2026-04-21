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
import { apiRequest } from "lib/api";
import { useCart } from "context/CartContext";
import valueIllustration from "assets/img/Trang nen, anh gioi thieu, quang cao/top-code.jpg";

type ProductDetail = {
  id: string;
  title: string;
  slug: string;
  price: number;
  categoryId: string;
  techStack?: string;
  repository?: string;
  description?: string;
  zipFileName?: string;
  createdAt?: string;
};

const categoryNameMap: Record<string, string> = {
  commerce: "Store & Ecommerce",
  portal: "Portal & Directory",
  management: "Quản lý & Báo cáo",
  utility: "Công cụ & Automation",
  food: "F&B Experience",
  ai: "Creative AI",
};

function SourceDetailPage() {
  const { sourceId } = useParams();
  const [product, setProduct] = React.useState<ProductDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
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
    const loadProduct = async () => {
      if (!sourceId) {
        setLoadError("Khong xac dinh duoc san pham");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);
        const result = await apiRequest<ProductDetail>(`/products/${sourceId}`, { method: "GET" }, false);
        setProduct(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Khong the tai chi tiet san pham";
        setLoadError(message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [sourceId]);

  React.useEffect(() => {
    if (!feedback) {
      return;
    }
    const timeout = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }
    const result = await addToCart(product.id);
    setFeedback(result.message);
  };

  const technologies = React.useMemo(
    () =>
      (product?.techStack || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [product]
  );

  const descriptionLines = React.useMemo(() => {
    if (!product?.description) {
      return [] as string[];
    }
    return product.description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 8);
  }, [product]);

  const quickInfo = React.useMemo(() => {
    if (!product) {
      return [] as string[];
    }
    const info: string[] = [];
    if (product.repository) {
      info.push("Có link tài liệu/repository");
    }
    if (product.zipFileName) {
      info.push(`Có file upload: ${product.zipFileName}`);
    }
    if (product.createdAt) {
      info.push(`Ngày đăng: ${new Date(product.createdAt).toLocaleString()}`);
    }
    return info;
  }, [product]);

  if (loading) {
    return (
      <>
        <StoreNavbar />
        <div className="wrapper">
          <div className="section">
            <Container>
              <div className="text-center mt-5">Dang tai chi tiet san pham...</div>
            </Container>
          </div>
          <StoreFooter />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <StoreNavbar />
        <div className="wrapper">
          <div className="section">
            <Container>
              <Alert color="danger">{loadError || "Khong tim thay san pham"}</Alert>
              <Button color="info" tag={Link} to="/store">
                Quay lại trang chủ
              </Button>
            </Container>
          </div>
          <StoreFooter />
        </div>
      </>
    );
  }

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="page-header page-header-small">
          <div
            className="page-header-image"
            style={{
              backgroundImage: `url(${valueIllustration})`,
              filter: "brightness(0.4)",
            }}
          ></div>
          <div className="content-center">
            <Container>
              <Row className="align-items-center">
                <Col md="8">
                  <h1 className="title text-white">{product.title}</h1>
                  <p className="text-white mb-3">
                    {product.description || "Sản phẩm được đăng tải từ hệ thống quản trị."}
                  </p>
                  <div className="mb-3">
                    {(technologies.length > 0 ? technologies : ["Source Code"]).map((tech) => (
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
                    <img
                      alt={product.title}
                      src={valueIllustration}
                      className="img-raised rounded img-fluid"
                    />
                  </CardBody>
                </Card>

                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Mô tả & tính năng</h4>
                  </CardHeader>
                  <CardBody>
                    <p>{product.description || "Chưa có mô tả chi tiết."}</p>
                    <ListGroup>
                      {(descriptionLines.length > 0 ? descriptionLines : ["Thông tin chi tiết sẽ được cập nhật thêm."]).map((item) => (
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
                      {product.repository
                        ? "Sản phẩm đã có liên kết tài liệu/repository. Bạn có thể dùng liên kết này để đọc README hoặc tài liệu triển khai."
                        : "Sản phẩm chưa có liên kết tài liệu. Hãy liên hệ admin để nhận README chi tiết."}
                    </p>
                    {product.repository ? (
                      <Button color="primary" className="mr-2" tag="a" href={product.repository} target="_blank" rel="noreferrer">
                        Mở tài liệu / Repository
                      </Button>
                    ) : (
                      <Button color="default" outline disabled>
                        Chưa có link tài liệu
                      </Button>
                    )}
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
                        <strong>Danh mục:</strong>
                        <div>{categoryNameMap[product.categoryId] || product.categoryId}</div>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Loại dự án:</strong>
                        <div>{categoryNameMap[product.categoryId] || "General"}</div>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Tech stack chính:</strong>
                        <div>
                          {(technologies.length > 0 ? technologies : ["Source Code"]).map((tech) => (
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
                      {(quickInfo.length > 0
                        ? quickInfo
                        : ["Thông tin package sẽ hiển thị khi admin cập nhật thêm mô tả."]).map((item) => (
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
                      {[
                        "Source code",
                        product.zipFileName ? `File zip: ${product.zipFileName}` : "Không có file zip đính kèm",
                        product.repository ? "Liên kết tài liệu / repository" : "Không có liên kết tài liệu",
                      ].map((item) => (
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
