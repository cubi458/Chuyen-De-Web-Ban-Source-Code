import React from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Progress,
  Row,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import { useAuth } from "context/AuthContext";
import { useOrders } from "context/OrderContext";

function DownloadsPage() {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const [downloading, setDownloading] = React.useState<string | null>(null);

  React.useEffect(() => {
    document.body.classList.add("downloads-page");
    document.body.classList.add("sidebar-collapse");
    return () => {
      document.body.classList.remove("downloads-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  if (authLoading) {
    return (
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/store/auth" replace />;
  }

  const paidOrders = orders.filter((order) => order.status === "paid");
  const totalDownloadable = paidOrders.reduce((count, order) => count + order.items.length, 0);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = (productId: string, productTitle: string) => {
    setDownloading(productId);
    // Simulate download delay
    setTimeout(() => {
      setDownloading(null);
      alert(`Link tải cho "${productTitle}" sẽ được gửi qua email đăng ký hoặc tải trực tiếp từ dashboard.`);
    }, 1500);
  };

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        {/* Hero Section */}
        <div
          className="page-header page-header-small"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            minHeight: "200px"
          }}
        >
          <div className="content-center">
            <Container>
              <Row className="align-items-center">
                <Col md="8">
                  <h1 className="title text-white mb-2">
                    <i className="now-ui-icons arrows-1_cloud-download-93 mr-3"></i>
                    Tải file sau thanh toán
                  </h1>
                  <p className="text-white-50">
                    Khi admin xác nhận thanh toán, trạng thái chuyển sang "Đã thanh toán" và bạn có thể tải .zip
                  </p>
                </Col>
                <Col md="4" className="text-md-right">
                  <div className="p-3 rounded" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <h3 className="text-white mb-0">{totalDownloadable}</h3>
                    <small className="text-white-50">Sản phẩm có thể tải</small>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </div>

        <div className="section" style={{ marginTop: "-50px" }}>
          <Container>
            <Row className="mb-4">
              <Col className="text-right">
                <Button color="primary" outline size="sm" tag={Link} to="/store/profile">
                  <i className="now-ui-icons files_paper mr-1"></i>
                  Xem lịch sử đơn hàng
                </Button>
              </Col>
            </Row>

            {ordersLoading ? (
              <Card className="shadow-lg">
                <CardBody className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                  </div>
                  <p className="mt-3 text-muted">Đang tải danh sách sản phẩm...</p>
                </CardBody>
              </Card>
            ) : paidOrders.length === 0 ? (
              <Card className="shadow-lg border-0">
                <CardBody className="text-center py-5">
                  <div
                    className="mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 120,
                      height: 120,
                      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)"
                    }}
                  >
                    <i className="now-ui-icons arrows-1_cloud-download-93" style={{ fontSize: "3rem", color: "#adb5bd" }}></i>
                  </div>
                  <h4 className="text-dark mb-2">Chưa có sản phẩm để tải</h4>
                  <p className="text-muted mb-4">
                    Bạn chưa có đơn hàng nào đã được thanh toán.<br />
                    Hãy khám phá các source code chất lượng cao của chúng tôi!
                  </p>
                  <Button color="primary" size="lg" tag={Link} to="/store/catalog">
                    <i className="now-ui-icons shopping_shop mr-2"></i>
                    Khám phá sản phẩm
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Row>
                {paidOrders.flatMap((order) =>
                  order.items.map((item) => (
                    <Col lg="6" key={`${order.id}-${item.productId}`} className="mb-4">
                      <Card className="shadow-sm h-100 border-0" style={{ transition: "transform 0.2s, box-shadow 0.2s" }}>
                        <CardHeader className="bg-white border-0 pb-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <Badge color="success" className="mb-2">
                                <i className="now-ui-icons ui-1_check mr-1"></i>
                                Đã thanh toán
                              </Badge>
                              <h5 className="mb-1 font-weight-bold">{item.productTitle}</h5>
                              <small className="text-muted">
                                <i className="now-ui-icons ui-1_calendar-60 mr-1"></i>
                                Mua ngày: {formatDate(order.createdAt)}
                              </small>
                            </div>
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: 50,
                                height: 50,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              }}
                            >
                              <i className="now-ui-icons files_box text-white"></i>
                            </div>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between text-muted small mb-1">
                              <span><i className="now-ui-icons files_single-copy-04 mr-1"></i>License: {item.license}</span>
                              <span>~25 MB</span>
                            </div>
                            <div className="text-muted small">
                              <i className="now-ui-icons business_money-coins mr-1"></i>
                              Giá: ${item.price}
                            </div>
                          </div>

                          {downloading === item.productId && (
                            <div className="mb-3">
                              <small className="text-muted">Đang chuẩn bị file...</small>
                              <Progress animated color="info" value={100} className="mt-1" style={{ height: 6 }} />
                            </div>
                          )}

                          <Button
                            color="info"
                            block
                            disabled={downloading === item.productId}
                            onClick={() => handleDownload(item.productId, item.productTitle)}
                          >
                            {downloading === item.productId ? (
                              <>
                                <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <i className="now-ui-icons arrows-1_cloud-download-93 mr-2"></i>
                                Tải file .zip
                              </>
                            )}
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            )}

            {/* Info Section */}
            {paidOrders.length > 0 && (
              <Card className="mt-4 border-0 bg-light">
                <CardBody>
                  <Row className="align-items-center">
                    <Col md="8">
                      <h5 className="mb-2">
                        <i className="now-ui-icons travel_info mr-2 text-info"></i>
                        Hướng dẫn tải file
                      </h5>
                      <ul className="mb-0 pl-3 text-muted">
                        <li>Link tải sẽ có hiệu lực trong 24 giờ</li>
                        <li>Bạn có thể tải lại không giới hạn số lần</li>
                        <li>File .zip bao gồm source code và tài liệu hướng dẫn</li>
                        <li>Liên hệ support nếu gặp vấn đề khi tải</li>
                      </ul>
                    </Col>
                    <Col md="4" className="text-md-right mt-3 mt-md-0">
                      <Button color="default" outline size="sm">
                        <i className="now-ui-icons ui-1_email-85 mr-1"></i>
                        Liên hệ hỗ trợ
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            )}
          </Container>
        </div>
        <StoreFooter />
      </div>
    </>
  );
}

export default DownloadsPage;
