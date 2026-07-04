import React from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormGroup,
  Input,
  ListGroup,
  ListGroupItem,
  Row,
  Table,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import bg8 from "assets/img/bg8.jpg";
import { findProductById } from "data/sourceCatalog";
import { useCart } from "context/CartContext";
import { apiRequest } from "lib/api";
import {
  validateDiscountCode,
  calculateDiscount,
  DiscountCode,
} from "data/discountCodes";

// We will validate against backend endpoint; keep local helpers for fallback

type DbProductResponse = {
  id: string;
  title: string;
  price: number;
  techStack?: string;
};

type CartProduct = {
  id: string;
  title: string;
  price: number;
  technologies: string[];
};

function CartPage() {
  const { items, removeItem } = useCart();
  const [productsById, setProductsById] = React.useState<Record<string, CartProduct>>({});
  const [discountInput, setDiscountInput] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] = React.useState<DiscountCode | null>(null);
  const [serverDiscountAmount, setServerDiscountAmount] = React.useState<number | null>(null);
  const [discountFeedback, setDiscountFeedback] = React.useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    document.body.classList.add("cart-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    return () => {
      document.body.classList.remove("cart-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  React.useEffect(() => {
    apiRequest<DbProductResponse[]>("/products", { method: "GET" }, false)
      .then((list) => {
        const next = list.reduce<Record<string, CartProduct>>((acc, product) => {
          acc[product.id] = {
            id: product.id,
            title: product.title,
            price: product.price,
            technologies: (product.techStack || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          };
          return acc;
        }, {});
        setProductsById(next);
      })
      .catch(() => {
        setProductsById({});
      });
  }, []);

  const resolveProduct = React.useCallback(
    (productId: string): CartProduct | null => {
      const dbProduct = productsById[productId];
      if (dbProduct) {
        return dbProduct;
      }
      const staticProduct = findProductById(productId);
      if (!staticProduct) {
        return null;
      }
      return {
        id: staticProduct.id,
        title: staticProduct.title,
        price: staticProduct.price,
        technologies: staticProduct.technologies,
      };
    },
    [productsById]
  );

  const subtotal = items.reduce((sum, item) => {
    const product = resolveProduct(item.productId);
    return product ? sum + product.price : sum;
  }, 0);

  const calculatedDiscount = serverDiscountAmount !== null
    ? serverDiscountAmount
    : appliedDiscount
      ? calculateDiscount(appliedDiscount, subtotal)
      : 0;
  const discountAmount = Math.min(calculatedDiscount, subtotal);
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyDiscount = () => {
    if (!discountInput.trim()) {
      setDiscountFeedback({ type: "danger", message: "Vui lòng nhập mã giảm giá" });
      return;
    }

    setDiscountFeedback(null);
    setServerDiscountAmount(null);

    apiRequest<{ valid: boolean; discountAmount: number; message: string; discount?: any }>(
      "/discounts/validate",
      {
        method: "POST",
        body: JSON.stringify({ code: discountInput.trim(), subtotal }),
      },
      false
    )
      .then((res) => {
        if (res.valid) {
          setAppliedDiscount(res.discount || { code: discountInput.trim() } as any);
          setServerDiscountAmount(res.discountAmount || 0);
          setDiscountFeedback({ type: "success", message: res.message || "Áp dụng thành công" });
        } else {
          setAppliedDiscount(null);
          setServerDiscountAmount(null);
          setDiscountFeedback({ type: "danger", message: res.message || "Mã không hợp lệ" });
        }
      })
      .catch((err) => {
        try {
          const result = validateDiscountCode(discountInput, subtotal);
          if (result.valid && result.discount) {
            setAppliedDiscount(result.discount);
            setDiscountFeedback({ type: "success", message: result.message });
          } else {
            setAppliedDiscount(null);
            setDiscountFeedback({ type: "danger", message: result.message });
          }
        } catch (e) {
          setAppliedDiscount(null);
          setDiscountFeedback({ type: "danger", message: err?.message || "Lỗi khi xác thực mã" });
        }
      });
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountFeedback(null);
    setServerDiscountAmount(null);
  };

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="page-header page-header-small">
          <div
            className="page-header-image"
style={{ backgroundImage: `url(${bg8})` }}
          ></div>
          <div className="content-center">
            <Container fluid className="catalog-container">
              <h1 className="title">Giỏ hàng</h1>
              <p className="category">Quản lý license trước khi thanh toán.</p>
            </Container>
          </div>
        </div>

        <div className="section">
          <Container>
            <Row className="mb-4 align-items-center">
              <Col md="8">
                <h2 className="title">Giỏ hàng</h2>
                <p className="category">Quản lý license trước khi thanh toán.</p>
                <p className="text-muted small mb-0">Mỗi source chỉ cần thêm một lần vào giỏ; không dùng số lượng.</p>
              </Col>
              <Col
                md="4"
                className="text-md-right d-flex flex-wrap justify-content-md-end"
                style={{ gap: "0.5rem" }}
              />
            </Row>

            <Row>
              <Col lg="8">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Sản phẩm</h4>
                  </CardHeader>
                  <CardBody className="table-responsive">
                    {items.length === 0 ? (
                      <p className="text-muted mb-0">Giỏ hàng trống.</p>
                    ) : (
                      <Table>
                        <thead>
                          <tr>
                            <th>Source code</th>
                            <th>License</th>
                            <th>Hành động</th>
                            <th className="text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => {
                            const product = resolveProduct(item.productId);
                            return (
                              <tr key={item.id}>
                                <td>
                                  <strong>{product?.title || `San pham ${item.productId}`}</strong>
                                  <div className="text-muted small">
                                    {product?.technologies?.slice(0, 2).join(" · ") || "Dang dong bo thong tin san pham"}
                                  </div>
                                </td>
                                <td>
                                  <Badge color="info" className="text-uppercase">
                                    {item.license}
                                  </Badge>
                                  <div className="text-muted small">
                                    Support: {item.supportPlan}
                                  </div>
                                </td>
                                <td>
                                  <Button
                                    color="link"
                                    className="text-danger p-0"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    Xóa
                                  </Button>
                                </td>
                                <td className="text-right">
                                  <strong>${product?.price || 0}</strong>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </Col>

              <Col lg="4">
                <Card className="mb-3 shadow-sm border-0">
                  <CardHeader className="bg-white border-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0">
                        <i className="now-ui-icons shopping_tag-content mr-2 text-primary"></i>
                        Mã giảm giá
                      </h4>
                      <Button
                        color="link"
                        size="sm"
                        className="p-0"
                        tag={Link}
                        to="/store/discount-codes"
                      >
                        Xem tất cả
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {discountFeedback && (
                      // Don't show the success Alert when a discount card is already displayed (avoid duplicate messages)
                      !(appliedDiscount && discountFeedback.type === "success") && (
                        <Alert
                          color={discountFeedback.type}
                          toggle={() => setDiscountFeedback(null)}
                          className="mb-3"
                        >
                          <i className={`now-ui-icons ${discountFeedback.type === "success" ? "ui-1_check" : "ui-1_simple-remove"} mr-2`}></i>
                          {discountFeedback.message}
                        </Alert>
                      )
                    )}
                    {appliedDiscount ? (
                      <div
                        className="p-3 rounded mb-3"
                        style={{
                          background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <Badge color="light" className="text-success font-weight-bold px-3 py-2">
                              {appliedDiscount.code}
                            </Badge>
                            <div className="text-white mt-2">
                              <strong>
                                {appliedDiscount.type === "percentage"
                                  ? `Giảm ${appliedDiscount.value}%`
                                  : `Giảm $${appliedDiscount.value}`}
                              </strong>
                            </div>
                          </div>
                          <Button
                            color="link"
                            className="text-white p-0"
                            onClick={handleRemoveDiscount}
                          >
                            <i className="now-ui-icons ui-1_simple-remove" style={{ fontSize: "1.2rem" }}></i>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FormGroup className="mb-3">
                          <div className="d-flex">
                            <Input
                              placeholder="Nhập mã giảm giá..."
                              value={discountInput}
                              onChange={(e) => setDiscountInput(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && handleApplyDiscount()}
                              className="flex-grow-1 mr-2"
                            />
                            <Button color="primary" onClick={handleApplyDiscount}>
                              <i className="now-ui-icons ui-1_check mr-1"></i>
                              Áp dụng
                            </Button>
                          </div>
                        </FormGroup>

                        {/* Available Codes Preview */}
                        <div className="border-top pt-3">
                          <small className="text-muted d-block mb-2">
                            <i className="now-ui-icons ui-2_favourite-28 mr-1"></i>
                            Mã có sẵn:
                          </small>
                          <div className="d-flex flex-wrap gap-1">
                            <Badge
                              color="light"
                              className="mr-1 mb-1 cursor-pointer border"
                              style={{ cursor: "pointer" }}
                              onClick={() => setDiscountInput("GIAM10")}
                            >
                              GIAM10 <small className="text-success">-10%</small>
                            </Badge>
                            <Badge
                              color="light"
                              className="mr-1 mb-1"
                              style={{ cursor: "pointer" }}
                              onClick={() => setDiscountInput("NEWUSER")}
                            >
                              NEWUSER <small className="text-success">-15%</small>
                            </Badge>
                            
                          </div>
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h4 className="mb-0">Tóm tắt</h4>
                  </CardHeader>
                  <CardBody>
                    <ListGroup flush>
                      <ListGroupItem className="d-flex justify-content-between">
                        <span>Tạm tính</span>
                        <strong>${subtotal}</strong>
                      </ListGroupItem>
                      {appliedDiscount && (
                        <ListGroupItem className="d-flex justify-content-between text-success">
                          <span>
                            Giảm giá ({appliedDiscount.code})
                          </span>
                          <strong>-${discountAmount.toFixed(2)}</strong>
                        </ListGroupItem>
                      )}
                      <ListGroupItem className="d-flex justify-content-between">
                        <span>Phí hỗ trợ</span>
                        <span>$0</span>
                      </ListGroupItem>
                      <ListGroupItem className="d-flex justify-content-between border-top pt-3">
                        <span><strong>Tổng cộng</strong></span>
                        <strong className="text-info h5 mb-0">${total.toFixed(2)}</strong>
                      </ListGroupItem>
                    </ListGroup>
                    <Button
                      color="info"
                      block
                      className="mt-3"
                      tag={Link}
                      to={{
                        pathname: "/store/checkout",
                      }}
                      state={{
                        discountCode: appliedDiscount?.code,
                        discountAmount,
                        subtotal,
                        total,
                      }}
                      disabled={items.length === 0}
                    >
                      Tiếp tục thanh toán
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
        <StoreFooter />
      </div>
    </>
  );
}

export default CartPage;
