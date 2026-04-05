import React from "react";
import { Link } from "react-router-dom";
import {
    Badge,
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Row,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import { sampleDiscountCodes, DiscountCode } from "data/discountCodes";

function DiscountCodesPage() {
    const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

    React.useEffect(() => {
        document.body.classList.add("discount-codes-page");
        document.body.classList.add("sidebar-collapse");
        return () => {
            document.body.classList.remove("discount-codes-page");
            document.body.classList.remove("sidebar-collapse");
        };
    }, []);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) < new Date();
    };

    const formatExpiryDate = (date: string) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const activeCodes = sampleDiscountCodes.filter(c => c.active && !isExpired(c.expiryDate));
    const expiredCodes = sampleDiscountCodes.filter(c => !c.active || isExpired(c.expiryDate));

    const getDiscountBadgeColor = (code: DiscountCode) => {
        if (code.type === "percentage" && code.value >= 15) return "danger";
        if (code.type === "percentage") return "warning";
        return "info";
    };

    const getGradient = (index: number) => {
        const gradients = [
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        ];
        return gradients[index % gradients.length];
    };

    return (
        <>
            <StoreNavbar />
            <div className="wrapper">
                {/* Hero Section */}
                <div
                    className="page-header page-header-small"
                    style={{
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        minHeight: "200px"
                    }}
                >
                    <div className="content-center">
                        <Container>
                            <Row className="align-items-center">
                                <Col md="8">
                                    <h1 className="title text-white mb-2">
                                        <i className="now-ui-icons shopping_tag-content mr-3"></i>
                                        Mã giảm giá
                                    </h1>
                                    <p className="text-white-50">
                                        Áp dụng mã giảm giá để tiết kiệm khi mua source code
                                    </p>
                                </Col>
                                <Col md="4" className="text-md-right">
                                    <div className="p-3 rounded" style={{ background: "rgba(255,255,255,0.15)" }}>
                                        <h3 className="text-white mb-0">{activeCodes.length}</h3>
                                        <small className="text-white-50">Mã đang hoạt động</small>
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
                                <Button color="primary" tag={Link} to="/store/cart">
                                    <i className="now-ui-icons shopping_cart-simple mr-1"></i>
                                    Đi tới giỏ hàng
                                </Button>
                            </Col>
                        </Row>

                        {/* Active Codes */}
                        <h4 className="mb-4">
                            <i className="now-ui-icons ui-1_check text-success mr-2"></i>
                            Mã đang hoạt động
                        </h4>

                        {activeCodes.length === 0 ? (
                            <Card className="shadow-sm border-0 mb-4">
                                <CardBody className="text-center py-5">
                                    <p className="text-muted mb-0">Hiện tại không có mã giảm giá nào đang hoạt động</p>
                                </CardBody>
                            </Card>
                        ) : (
                            <Row className="mb-5">
                                {activeCodes.map((code, index) => (
                                    <Col lg="6" key={code.code} className="mb-4">
                                        <Card className="shadow-sm border-0 h-100 overflow-hidden">
                                            <div
                                                className="p-3"
                                                style={{ background: getGradient(index) }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <Badge color={getDiscountBadgeColor(code)} className="px-3 py-2 mb-2">
                                                            {code.type === "percentage"
                                                                ? `GIẢM ${code.value}%`
                                                                : `GIẢM $${code.value}`}
                                                        </Badge>
                                                        <h3 className="text-white mb-0 font-weight-bold">{code.code}</h3>
                                                    </div>
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center bg-white"
                                                        style={{ width: 60, height: 60 }}
                                                    >
                                                        <i
                                                            className="now-ui-icons shopping_tag-content"
                                                            style={{ fontSize: "1.5rem", color: "#f5576c" }}
                                                        ></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardBody>
                                                <p className="mb-2">{code.description}</p>
                                                <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                                                    <span>
                                                        <i className="now-ui-icons business_money-coins mr-1"></i>
                                                        Đơn tối thiểu: ${code.minOrder}
                                                    </span>
                                                    <span>
                                                        <i className="now-ui-icons ui-1_calendar-60 mr-1"></i>
                                                        HSD: {formatExpiryDate(code.expiryDate)}
                                                    </span>
                                                </div>
                                                <Button
                                                    color={copiedCode === code.code ? "success" : "primary"}
                                                    block
                                                    onClick={() => copyToClipboard(code.code)}
                                                >
                                                    {copiedCode === code.code ? (
                                                        <>
                                                            <i className="now-ui-icons ui-1_check mr-2"></i>
                                                            Đã sao chép!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="now-ui-icons files_single-copy-04 mr-2"></i>
                                                            Sao chép mã
                                                        </>
                                                    )}
                                                </Button>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {/* Expired Codes */}
                        {expiredCodes.length > 0 && (
                            <>
                                <h4 className="mb-4 text-muted">
                                    <i className="now-ui-icons ui-1_simple-remove mr-2"></i>
                                    Mã đã hết hạn
                                </h4>
                                <Row>
                                    {expiredCodes.map((code) => (
                                        <Col lg="6" key={code.code} className="mb-4">
                                            <Card className="shadow-sm border-0 h-100" style={{ opacity: 0.6 }}>
                                                <CardBody>
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <h5 className="mb-0">
                                                            <del>{code.code}</del>
                                                        </h5>
                                                        <Badge color="secondary">Hết hạn</Badge>
                                                    </div>
                                                    <p className="text-muted small mb-0">{code.description}</p>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}

                        {/* How to use */}
                        <Card className="mt-4 border-0 bg-light">
                            <CardBody>
                                <Row className="align-items-center">
                                    <Col md="8">
                                        <h5 className="mb-2">
                                            <i className="now-ui-icons travel_info mr-2 text-info"></i>
                                            Cách sử dụng mã giảm giá
                                        </h5>
                                        <ol className="mb-0 pl-3 text-muted">
                                            <li>Sao chép mã giảm giá bạn muốn sử dụng</li>
                                            <li>Thêm sản phẩm vào giỏ hàng</li>
                                            <li>Dán mã vào ô "Mã giảm giá" và nhấn "Áp dụng"</li>
                                            <li>Giá sẽ được giảm tự động nếu đơn hàng đủ điều kiện</li>
                                        </ol>
                                    </Col>
                                    <Col md="4" className="text-md-right mt-3 mt-md-0">
                                        <Button color="info" tag={Link} to="/store/catalog">
                                            <i className="now-ui-icons shopping_shop mr-1"></i>
                                            Mua sắm ngay
                                        </Button>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Container>
                </div>
                <StoreFooter />
            </div>
        </>
    );
}

export default DiscountCodesPage;
