import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import {
  findProductById,
  paymentMethods,
} from "data/sourceCatalog";
import { useCart } from "context/CartContext";
import { useAuth } from "context/AuthContext";
import { useOrders, OrderItem } from "context/OrderContext";

const simulatePaymentSuccess = () =>
  new Promise<string>((resolve) => {
    setTimeout(() => {
      const token = `TEST-${Date.now().toString(36).toUpperCase()}`;
      resolve(token);
    }, 1200);
  });

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();

  const discountCode = (location.state as any)?.discountCode || "";
  const discountAmount = (location.state as any)?.discountAmount || 0;

  const [buyer, setBuyer] = React.useState({
    fullName: user?.displayName || "",
    email: user?.email || "",
    company: "",
    note: "",
  });
  const [payment, setPayment] = React.useState(paymentMethods[0].id);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "danger"; message: string } | null>(null);

  React.useEffect(() => {
    document.body.classList.add("checkout-page");
    document.body.classList.add("sidebar-collapse");
    return () => {
      document.body.classList.remove("checkout-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  React.useEffect(() => {
    if (user) {
      setBuyer((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const subtotal = items.reduce((sum, item) => {
    const product = findProductById(item.productId);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const total = Math.max(0, subtotal - discountAmount);

  const handleSubmitOrder = async () => {
    if (!user) {
      setFeedback({ type: "danger", message: "Vui lòng đăng nhập để ghi nhận đơn hàng" });
      return;
    }

    if (!buyer.fullName.trim() || !buyer.email.trim()) {
      setFeedback({ type: "danger", message: "Vui lòng điền đầy đủ họ tên và email" });
      return;
    }

    if (items.length === 0) {
      setFeedback({ type: "danger", message: "Giỏ hàng trống" });
      return;
    }

    setSubmitting(true);
    try {
      const orderItems: OrderItem[] = items.map((item) => {
        const product = findProductById(item.productId);
        return {
          productId: item.productId,
          productTitle: product?.title || item.productId,
          price: product?.price || 0,
          quantity: item.quantity,
          license: item.license,
        };
      });

      const simulatedPaymentId = await simulatePaymentSuccess();

      await createOrder({
        items: orderItems,
        subtotal,
        discountCode: discountCode || undefined,
        discountAmount,
        total,
        paymentMethod: paymentMethods.find((m) => m.id === payment)?.label || payment,
        status: "paid",
        note: buyer.note || undefined,
      });

      setFeedback({
        type: "success",
        message: `Thanh toán test thành công! Mã tham chiếu ${simulatedPaymentId}`,
      });

      setTimeout(() => {
        navigate("/store/profile", {
          state: { paymentId: simulatedPaymentId },
        });
      }, 2000);
    } catch (error) {
      console.error("Error creating order:", error);
      setFeedback({ type: "danger", message: "Không thể tạo đơn hàng. Vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="section">
          <Container>
            <Row className="mb-4 align-items-center">
              <Col md="8">
                <h2 className="title">Thanh toán</h2>
                <p className="category">
                  Điền thông tin người mua và chọn phương thức thanh toán.
                </p>
              </Col>
              <Col
                md="4"
                className="text-md-right d-flex flex-wrap justify-content-md-end"
                style={{ gap: "0.5rem" }}
              >
                <Button color="link" tag={Link} to="/store/cart">
                  ← Giỏ hàng
                </Button>
                <Button color="link" tag={Link} to="/">
                  Trang chủ
                </Button>
                <Button color="link" tag={Link} to="/store/profile">
                  Thông tin cá nhân
                </Button>
              </Col>
            </Row>

            {feedback && (
              <Alert color={feedback.type} toggle={() => setFeedback(null)} className="mb-4">
                {feedback.message}
              </Alert>
            )}

            {!user && (
              <Alert color="warning" className="mb-4">
                <strong>Lưu ý:</strong> Bạn cần{" "}
                <Link to="/store/auth" className="alert-link">đăng nhập</Link>{" "}
                để theo dõi đơn hàng và tải file sau thanh toán.
              </Alert>
            )}

            <Row>
              <Col lg="8">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Thông tin người mua</h4>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>Họ tên *</Label>
                            <Input
                              value={buyer.fullName}
                              onChange={(e) =>
                                setBuyer((prev) => ({ ...prev, fullName: e.target.value }))
                              }
                              placeholder="VD: Nguyễn Văn A"
                              required
                            />
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={buyer.email}
                              onChange={(e) =>
                                setBuyer((prev) => ({ ...prev, email: e.target.value }))
                              }
                              placeholder="you@company.com"
                              required
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>Công ty / Team</Label>
                            <Input
                              value={buyer.company}
                              onChange={(e) =>
                                setBuyer((prev) => ({ ...prev, company: e.target.value }))
                              }
                              placeholder="Tên công ty / freelancer"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label>Ghi chú</Label>
                            <Input
                              value={buyer.note}
                              onChange={(e) =>
                                setBuyer((prev) => ({ ...prev, note: e.target.value }))
                              }
                              placeholder="Yêu cầu hoá đơn, tùy chỉnh..."
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h4 className="mb-0">Phương thức thanh toán</h4>
                  </CardHeader>
                  <CardBody>
                    {paymentMethods.map((method) => (
                      <FormGroup check key={method.id} className="mb-2">
                        <Label check>
                          <Input
                            type="radio"
                            name="payment"
                            checked={payment === method.id}
                            onChange={() => setPayment(method.id)}
                          />
                          <span className="form-check-sign"></span>
                          {method.label}
                        </Label>
                      </FormGroup>
                    ))}
                    <small className="text-muted">
                      Với chuyển khoản, chúng tôi gửi thông tin tài khoản sau khi nhận đơn.
                      Các ví điện tử hiển thị QR code ngay.
                    </small>
                  </CardBody>
                </Card>
              </Col>

              <Col lg="4">
                <Card>
                  <CardHeader>
                    <h4 className="mb-0">Đơn hàng</h4>
                  </CardHeader>
                  <CardBody>
                    <ListGroup flush>
                      {items.map((item) => {
                        const product = findProductById(item.productId);
                        if (!product) {
                          return null;
                        }
                        return (
                          <ListGroupItem key={`checkout-${item.productId}`} className="border-0 px-0">
                            <div className="d-flex justify-content-between">
                              <div>
                                <strong>{product.title}</strong>
                                <div className="text-muted small">
                                  License: {item.license}
                                </div>
                              </div>
                              <div>${product.price * item.quantity}</div>
                            </div>
                          </ListGroupItem>
                        );
                      })}
                      <ListGroupItem className="d-flex justify-content-between border-0 px-0">
                        <span>Tạm tính</span>
                        <span>${subtotal}</span>
                      </ListGroupItem>
                      {discountCode && (
                        <ListGroupItem className="d-flex justify-content-between border-0 px-0 text-success">
                          <span>
                            Giảm giá <Badge color="success">{discountCode}</Badge>
                          </span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </ListGroupItem>
                      )}
                      <ListGroupItem className="d-flex justify-content-between border-0 px-0 pt-3 border-top">
                        <strong>Tổng cộng</strong>
                        <strong className="text-info h5 mb-0">${total.toFixed(2)}</strong>
                      </ListGroupItem>
                    </ListGroup>
                    <Button
                      color="info"
                      block
                      className="mt-3"
                      onClick={handleSubmitOrder}
                      disabled={submitting || items.length === 0}
                    >
                      {submitting ? "Đang xử lý..." : "Gửi yêu cầu thanh toán"}
                    </Button>
                    <p className="text-muted small mt-2">
                      Sau khi xác nhận thanh toán, link tải sẽ được mở trong mục "Tải về".
                    </p>
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

export default CheckoutPage;
