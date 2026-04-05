import React from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Col,
  Container,
  Row,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import {
  sourceCategories,
  sourceProducts,
  SourceProduct,
} from "data/sourceCatalog";
import { useCart } from "context/CartContext";

function CatalogPage() {
  const { addToCart } = useCart();
  const [feedback, setFeedback] = React.useState<string | null>(null);
  type DragSession = {
    isDragging: boolean;
    startX: number;
    scrollLeft: number;
    containerLeft: number;
    pointerId?: number;
  };

  const carouselRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const autoScrollTimers = React.useRef<Record<string, number>>({});
  const dragState = React.useRef<Record<string, DragSession>>({});

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

  const handleAddToCart = (productId: string) => {
    const result = addToCart(productId);
    setFeedback(result.message);
  };

  const scrollCarousel = (categoryId: string, direction: "left" | "right") => {
    const node = carouselRefs.current[categoryId];
    if (!node) {
      return;
    }
    const scrollAmount = direction === "left" ? -320 : 320;
    node.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const buildDeck = (products: SourceProduct[]) => {
    if (products.length === 0) {
      return [] as Array<{ product: SourceProduct; index: number }>;
    }
    const target = Math.max(products.length * 2, 12);
    return Array.from({ length: target }, (_, index) => ({
      product: products[index % products.length],
      index,
    }));
  };
  const beginDragSession = (categoryId: string, clientX: number, pointerId?: number) => {
    const node = carouselRefs.current[categoryId];
    if (!node) {
      return null;
    }

    const rect = node.getBoundingClientRect();
    const drag: DragSession = {
      isDragging: true,
      startX: clientX - rect.left,
      scrollLeft: node.scrollLeft,
      containerLeft: rect.left,
      pointerId,
    };

    dragState.current[categoryId] = drag;
    node.classList.add("is-dragging");
    return { node, drag } as const;
  };

  const handleMouseDrag = (categoryId: string, event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const session = beginDragSession(categoryId, event.clientX);
    if (!session) {
      return;
    }
    const { node, drag } = session;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!drag.isDragging) {
        return;
      }
      moveEvent.preventDefault();
      const x = moveEvent.clientX - drag.containerLeft;
      const walk = (x - drag.startX) * 1.1;
      node.scrollLeft = drag.scrollLeft - walk;
    };

    const handleMouseUp = () => {
      drag.isDragging = false;
      node.classList.remove("is-dragging");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchDrag = (categoryId: string, event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      return;
    }
    event.preventDefault();
    const touch = event.touches[0];
    const session = beginDragSession(categoryId, touch.clientX, touch.identifier);
    if (!session) {
      return;
    }
    const { node, drag } = session;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!drag.isDragging) {
        return;
      }
      const activeTouch = Array.from(moveEvent.touches).find(
        (t) => t.identifier === drag.pointerId
      );
      if (!activeTouch) {
        return;
      }
      const x = activeTouch.clientX - drag.containerLeft;
      const walk = (x - drag.startX) * 1.1;
      node.scrollLeft = drag.scrollLeft - walk;
      moveEvent.preventDefault();
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      const ended = Array.from(endEvent.changedTouches).some(
        (t) => t.identifier === drag.pointerId
      );
      if (!ended) {
        return;
      }
      drag.isDragging = false;
      node.classList.remove("is-dragging");
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
  };

  const stopDragSession = (categoryId: string) => {
    const drag = dragState.current[categoryId];
    if (!drag || !drag.isDragging) {
      return;
    }
    drag.isDragging = false;
    const node = carouselRefs.current[categoryId];
    if (node) {
      node.classList.remove("is-dragging");
    }
  };

  const scheduleAutoScroll = (categoryId: string) => {
    if (autoScrollTimers.current[categoryId]) {
      window.clearTimeout(autoScrollTimers.current[categoryId]);
    }

    autoScrollTimers.current[categoryId] = window.setTimeout(() => {
      const node = carouselRefs.current[categoryId];
      if (!node) {
        return;
      }
      const maxScroll = node.scrollWidth - node.clientWidth;
      const direction = node.scrollLeft >= maxScroll - 10 ? "left" : "right";
      scrollCarousel(categoryId, direction);
      scheduleAutoScroll(categoryId);
    }, 5000 + Math.random() * 3000);
  };

  React.useEffect(() => {
    sourceCategories.forEach((category) => scheduleAutoScroll(category.id));
    return () => {
      Object.values(autoScrollTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  React.useEffect(() => {
    if (!feedback) {
      return;
    }
    const timeout = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

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
            <Container fluid className="catalog-container">
              <h1 className="title">Danh mục source code</h1>
              <p>
                Phân loại theo nền tảng, công nghệ và use-case. Chọn chủ đề để xem
                toàn bộ source code liên quan.
              </p>
            </Container>
          </div>
        </div>

        <div className="section section-basic">
          <Container fluid className="catalog-container">
            {feedback && (
              <Alert
                color="success"
                toggle={() => setFeedback(null)}
                className="sticky-feedback"
              >
                {feedback}
              </Alert>
            )}
            {sourceCategories.map((category) => {
              const products = sourceProducts.filter(
                (product) => product.categoryId === category.id
              );
              const deck = buildDeck(products);

              return (
                <Row className="mb-5" key={category.id}>
                  <Col md="4">
                    <div className="icon icon-lg icon-shape icon-gradient mb-3">
                      <i className={category.icon}></i>
                    </div>
                    <h3>{category.name}</h3>
                    <p className="description">{category.description}</p>
                    <div className="mb-3">
                      {category.tags.map((tag) => (
                        <Badge color="default" className="mr-1" key={tag}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-muted">
                      {products.length > 0
                        ? `${products.length} source code`
                        : "Đang cập nhật"}
                    </p>
                  </Col>
                  <Col md="8">
                    {products.length === 0 ? (
                      <Card className="card-plain border">
                        <CardBody>
                          <p className="mb-0">
                            Chưa có source code nào trong danh mục này. Liên hệ đội
                            ngũ để được nhận thông báo khi có bộ mới.
                          </p>
                        </CardBody>
                      </Card>
                    ) : (
                      <div className="category-carousel-wrapper">
                        <Button
                          color="default"
                          className="carousel-nav carousel-nav--prev"
                          onClick={() => scrollCarousel(category.id, "left")}
                          type="button"
                          aria-label="Xem sản phẩm trước"
                        >
                          <i className="now-ui-icons arrows-1_minimal-left"></i>
                        </Button>
                        <div
                          className="category-carousel"
                          ref={(node) => {
                            carouselRefs.current[category.id] = node;
                          }}
                          onMouseDown={(event) => handleMouseDrag(category.id, event)}
                          onTouchStart={(event) => handleTouchDrag(category.id, event)}
                          onMouseLeave={() => stopDragSession(category.id)}
                        >
                          {deck.map(({ product, index }) => (
                            <div className="category-carousel-item" key={`${product.id}-${index}`}>
                              <Card className="card-product h-100">
                                <div
                                  className="card-image"
                                  style={{
                                    height: 140,
                                    backgroundImage: `url(${product.coverImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                ></div>
                                <CardBody>
                                  <CardTitle tag="h4">{product.title}</CardTitle>
                                  <p className="card-description">{product.summary}</p>
                                  <div className="mb-2">
                                    {product.technologies.slice(0, 3).map((tech) => (
                                      <Badge
                                        color="default"
                                        className="mr-1"
                                        key={`${product.id}-${tech}-${index}`}
                                      >
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardBody>
                                <CardFooter className="d-flex justify-content-between align-items-center">
                                  <span className="font-weight-bold">${product.price}</span>
                                  <div className="d-flex">
                                    <Button
                                      color="default"
                                      size="sm"
                                      className="mr-2"
                                      onClick={() => handleAddToCart(product.id)}
                                    >
                                      Thêm sản phẩm
                                    </Button>
                                    <Button
                                      color="info"
                                      size="sm"
                                      tag={Link}
                                      to={`/store/source/${product.id}`}
                                    >
                                      Chi tiết
                                    </Button>
                                  </div>
                                </CardFooter>
                              </Card>
                            </div>
                          ))}
                        </div>
                        <Button
                          color="default"
                          className="carousel-nav carousel-nav--next"
                          onClick={() => scrollCarousel(category.id, "right")}
                          type="button"
                          aria-label="Xem sản phẩm tiếp theo"
                        >
                          <i className="now-ui-icons arrows-1_minimal-right"></i>
                        </Button>
                      </div>
                    )}
                  </Col>
                </Row>
              );
            })}
          </Container>
        </div>
        <StoreFooter />
      </div>
    </>
  );
}

export default CatalogPage;
