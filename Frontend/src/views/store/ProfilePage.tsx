import React from "react";
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
    Table,
} from "reactstrap";
import { Link, Navigate } from "react-router-dom";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import { useAuth } from "context/AuthContext";
import { useOrders, Order } from "context/OrderContext";

function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { orders, loading: ordersLoading } = useOrders();
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

    React.useEffect(() => {
        document.body.classList.add("profile-page");
        document.body.classList.add("sidebar-collapse");
        return () => {
            document.body.classList.remove("profile-page");
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

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge color="success"><i className="now-ui-icons ui-1_check mr-1"></i>Đã thanh toán</Badge>;
            case "cancelled":
                return <Badge color="danger"><i className="now-ui-icons ui-1_simple-remove mr-1"></i>Đã hủy</Badge>;
            default:
                return <Badge color="warning"><i className="now-ui-icons loader_refresh mr-1"></i>Chờ xác nhận</Badge>;
        }
    };

    const accountCreated = user.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString("vi-VN")
        : "N/A";

    // Calculate stats
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.status === "paid").length;
    const totalSpent = orders.filter(o => o.status === "paid").reduce((sum, o) => sum + o.total, 0);
    const totalProducts = orders.reduce((sum, o) => sum + o.items.length, 0);

    return (
        <>
            <StoreNavbar />
            <div className="wrapper">
                {/* Hero Section */}
                <div
                    className="page-header page-header-small"
                    style={{
                        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                        minHeight: "200px"
                    }}
                >
                    <div className="content-center">
                        <Container>
                            <Row className="align-items-center">
                                <Col md="6">
                                    <h1 className="title text-white mb-2">
                                        <i className="now-ui-icons users_single-02 mr-3"></i>
                                        Tài khoản của tôi
                                    </h1>
                                    <p className="text-white-50">
                                        Quản lý thông tin cá nhân và theo dõi lịch sử mua hàng
                                    </p>
                                </Col>
                                <Col md="6">
                                    <Row>
                                        <Col xs="4">
                                            <div className="text-center p-2 rounded" style={{ background: "rgba(255,255,255,0.15)" }}>
                                                <h3 className="text-white mb-0">{totalOrders}</h3>
                                                <small className="text-white-50">Đơn hàng</small>
                                            </div>
                                        </Col>
                                        <Col xs="4">
                                            <div className="text-center p-2 rounded" style={{ background: "rgba(255,255,255,0.15)" }}>
                                                <h3 className="text-white mb-0">{totalProducts}</h3>
                                                <small className="text-white-50">Sản phẩm</small>
                                            </div>
                                        </Col>
                                        <Col xs="4">
                                            <div className="text-center p-2 rounded" style={{ background: "rgba(255,255,255,0.15)" }}>
                                                <h3 className="text-white mb-0">${totalSpent}</h3>
                                                <small className="text-white-50">Đã chi</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>

                <div className="section" style={{ marginTop: "-50px" }}>
                    <Container>
                        <Row>
                            <Col lg="4">
                                <Card className="shadow-lg border-0 mb-4">
                                    <CardHeader className="bg-white border-0 pb-0">
                                        <h4 className="mb-0">
                                            <i className="now-ui-icons business_badge mr-2 text-primary"></i>
                                            Thông tin cá nhân
                                        </h4>
                                    </CardHeader>
                                    <CardBody className="pt-3">
                                        <div className="text-center mb-4">
                                            <div
                                                className="d-inline-flex align-items-center justify-content-center"
                                                style={{
                                                    width: 100,
                                                    height: 100,
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    borderRadius: "50%",
                                                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
                                                }}
                                            >
                                                <span className="text-white" style={{ fontSize: "2.5rem", fontWeight: 600 }}>
                                                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <h4 className="mt-3 mb-1 font-weight-bold">{user.displayName || "Người dùng"}</h4>
                                            <p className="text-muted small mb-0">{user.email}</p>
                                        </div>

                                        <div className="border-top pt-3">
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted"><i className="now-ui-icons ui-1_email-85 mr-2"></i>Email</span>
                                                <strong className="text-right" style={{ maxWidth: "60%", wordBreak: "break-all" }}>{user.email}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted"><i className="now-ui-icons ui-1_check mr-2"></i>Trạng thái</span>
                                                {user.emailVerified ? (
                                                    <Badge color="success">Đã xác thực</Badge>
                                                ) : (
                                                    <Badge color="warning">Chưa xác thực</Badge>
                                                )}
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted"><i className="now-ui-icons ui-1_calendar-60 mr-2"></i>Tham gia</span>
                                                <strong>{accountCreated}</strong>
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="d-flex">
                                            <Button color="info" outline className="flex-grow-1 mr-2" tag={Link} to="/store/downloads">
                                                <i className="now-ui-icons arrows-1_cloud-download-93 mr-1"></i>
                                                Tải về
                                            </Button>
                                            <Button color="danger" outline onClick={logout}>
                                                <i className="now-ui-icons media-1_button-power"></i>
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Quick Stats Card */}
                                <Card className="shadow-sm border-0">
                                    <CardBody>
                                        <h5 className="mb-3">
                                            <i className="now-ui-icons business_chart-bar-32 mr-2 text-info"></i>
                                            Thống kê nhanh
                                        </h5>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted">Đơn thành công</span>
                                            <Badge color="success">{paidOrders}/{totalOrders}</Badge>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted">Tổng sản phẩm</span>
                                            <span className="font-weight-bold">{totalProducts}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted">Tổng chi tiêu</span>
                                            <span className="font-weight-bold text-success">${totalSpent}</span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col lg="8">
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="bg-white border-0">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="mb-0">
                                                <i className="now-ui-icons shopping_bag-16 mr-2 text-primary"></i>
                                                Lịch sử mua hàng
                                            </h4>
                                            <Button color="info" size="sm" tag={Link} to="/store/downloads">
                                                <i className="now-ui-icons arrows-1_cloud-download-93 mr-1"></i>
                                                Tải về
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="table-responsive">
                                        {ordersLoading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="sr-only">Đang tải...</span>
                                                </div>
                                                <p className="mt-3 text-muted">Đang tải đơn hàng...</p>
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <div className="text-center py-5">
                                                <div
                                                    className="mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle"
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)"
                                                    }}
                                                >
                                                    <i className="now-ui-icons shopping_bag-16" style={{ fontSize: "2.5rem", color: "#adb5bd" }}></i>
                                                </div>
                                                <h5 className="text-dark mb-2">Chưa có đơn hàng</h5>
                                                <p className="text-muted mb-4">
                                                    Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
                                                </p>
                                                <Button color="primary" tag={Link} to="/store/catalog">
                                                    <i className="now-ui-icons shopping_shop mr-2"></i>
                                                    Khám phá sản phẩm
                                                </Button>
                                            </div>
                                        ) : (
                                            <Table hover responsive>
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Mã đơn</th>
                                                        <th>Sản phẩm</th>
                                                        <th>Tổng tiền</th>
                                                        <th>Trạng thái</th>
                                                        <th>Ngày đặt</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((order) => (
                                                        <tr key={order.id} style={{ cursor: "pointer" }} onClick={() => setSelectedOrder(order)}>
                                                            <td>
                                                                <code className="bg-light px-2 py-1 rounded">{order.id?.slice(0, 8)}...</code>
                                                            </td>
                                                            <td>
                                                                {order.items.slice(0, 2).map((item) => (
                                                                    <div key={item.productId} className="small">
                                                                        {item.productTitle} x{item.quantity}
                                                                    </div>
                                                                ))}
                                                                {order.items.length > 2 && (
                                                                    <small className="text-muted">+{order.items.length - 2} sản phẩm khác</small>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <strong className="text-info">${order.total}</strong>
                                                                {order.discountCode && (
                                                                    <div className="small text-success">
                                                                        <i className="now-ui-icons shopping_tag-content mr-1"></i>
                                                                        -{order.discountAmount}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>{getStatusBadge(order.status)}</td>
                                                            <td className="small">{formatDate(order.createdAt)}</td>
                                                            <td>
                                                                <Button color="link" size="sm" className="p-0">
                                                                    <i className="now-ui-icons arrows-1_minimal-right"></i>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <StoreFooter />

                {/* Order Detail Modal */}
                <Modal isOpen={!!selectedOrder} toggle={() => setSelectedOrder(null)} size="lg">
                    <ModalHeader toggle={() => setSelectedOrder(null)}>
                        <i className="now-ui-icons shopping_bag-16 mr-2"></i>
                        Chi tiết đơn hàng #{selectedOrder?.id?.slice(0, 8)}
                    </ModalHeader>
                    <ModalBody>
                        {selectedOrder && (
                            <>
                                <Row className="mb-4">
                                    <Col sm="6">
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Trạng thái</small>
                                            {getStatusBadge(selectedOrder.status)}
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Ngày đặt</small>
                                            <strong>{formatDate(selectedOrder.createdAt)}</strong>
                                        </div>
                                    </Col>
                                    <Col sm="6">
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Phương thức thanh toán</small>
                                            <strong>{selectedOrder.paymentMethod}</strong>
                                        </div>
                                        {selectedOrder.note && (
                                            <div className="mb-3">
                                                <small className="text-muted d-block">Ghi chú</small>
                                                <span>{selectedOrder.note}</span>
                                            </div>
                                        )}
                                    </Col>
                                </Row>

                                <h5 className="mb-3">Sản phẩm</h5>
                                <Table bordered size="sm">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Tên sản phẩm</th>
                                            <th>License</th>
                                            <th>Số lượng</th>
                                            <th className="text-right">Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item) => (
                                            <tr key={item.productId}>
                                                <td>{item.productTitle}</td>
                                                <td><Badge color="info">{item.license}</Badge></td>
                                                <td>{item.quantity}</td>
                                                <td className="text-right">${item.price * item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="text-right">Tạm tính</td>
                                            <td className="text-right">${selectedOrder.subtotal}</td>
                                        </tr>
                                        {selectedOrder.discountCode && (
                                            <tr className="text-success">
                                                <td colSpan={3} className="text-right">
                                                    Giảm giá ({selectedOrder.discountCode})
                                                </td>
                                                <td className="text-right">-${selectedOrder.discountAmount}</td>
                                            </tr>
                                        )}
                                        <tr className="font-weight-bold">
                                            <td colSpan={3} className="text-right">Tổng cộng</td>
                                            <td className="text-right text-info">${selectedOrder.total}</td>
                                        </tr>
                                    </tfoot>
                                </Table>

                                {selectedOrder.status === "paid" && (
                                    <div className="text-center mt-4">
                                        <Button color="info" tag={Link} to="/store/downloads">
                                            <i className="now-ui-icons arrows-1_cloud-download-93 mr-2"></i>
                                            Đi tới trang tải về
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </ModalBody>
                </Modal>
            </div>
        </>
    );
}

export default ProfilePage;
