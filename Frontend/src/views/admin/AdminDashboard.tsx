import React from "react";
import {
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
  Table,
} from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import {
  findProductById,
  initialAdminOrders,
  sourceCategories,
} from "data/sourceCatalog";

function AdminDashboard() {
  const [orders, setOrders] = React.useState(initialAdminOrders);
  const [newSource, setNewSource] = React.useState({
    title: "",
    price: "",
    categoryId: sourceCategories[0].id,
    techStack: "",
    repository: "",
  });
  const [description, setDescription] = React.useState(
    "Mô tả ngắn gọn về source code, liệt kê chức năng chính và hướng dẫn cài đặt."
  );
  const [zipName, setZipName] = React.useState("chua-chon");

  React.useEffect(() => {
    document.body.classList.add("admin-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    return () => {
      document.body.classList.remove("admin-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  const confirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "paid" } : order
      )
    );
  };

  return (
    <>
      <AdminNavbar />
      <div className="wrapper">
        <div className="section">
          <Container>
            <Row className="mb-4">
              <Col md="8">
                <h2 className="title">Bảng điều khiển Admin</h2>
                <p className="category">
                  Quản lý kho source code, upload bản build mới và xử lý đơn hàng.
                </p>
              </Col>
              <Col md="4" className="text-md-right">
                <Button color="primary">+ Tạo source mới</Button>
              </Col>
            </Row>

            <Row>
              <Col lg="8">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Thêm source code</h4>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>Tiêu đề</Label>
                            <Input
                              value={newSource.title}
                              onChange={(e) =>
                                setNewSource((prev) => ({ ...prev, title: e.target.value }))
                              }
                              placeholder="VD: Next.js SaaS Kit"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="3">
                          <FormGroup>
                            <Label>Giá (USD)</Label>
                            <Input
                              type="number"
                              value={newSource.price}
                              onChange={(e) =>
                                setNewSource((prev) => ({ ...prev, price: e.target.value }))
                              }
                              placeholder="79"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="3">
                          <FormGroup>
                            <Label>Danh mục</Label>
                            <Input
                              type="select"
                              value={newSource.categoryId}
                              onChange={(e) =>
                                setNewSource((prev) => ({ ...prev, categoryId: e.target.value }))
                              }
                            >
                              {sourceCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>Tech stack</Label>
                            <Input
                              value={newSource.techStack}
                              onChange={(e) =>
                                setNewSource((prev) => ({ ...prev, techStack: e.target.value }))
                              }
                              placeholder="React, Supabase, Tailwind"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label>Repo / Figma / Tài liệu</Label>
                            <Input
                              value={newSource.repository}
                              onChange={(e) =>
                                setNewSource((prev) => ({ ...prev, repository: e.target.value }))
                              }
                              placeholder="https://github.com/..."
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Button color="info">Lưu nháp</Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>

              <Col lg="4">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Upload file .zip</h4>
                  </CardHeader>
                  <CardBody>
                    <FormGroup>
                      <Label>Chọn file build</Label>
                      <Input
                        type="file"
                        accept=".zip"
                        onChange={(e) => setZipName(e.target.files?.[0]?.name ?? "chua-chon")}
                      />
                      <small className="d-block mt-2 text-muted">
                        File hiện tại: {zipName}
                      </small>
                    </FormGroup>
                    <Button color="success" block>
                      Upload len he thong Backend
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg="6">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Chỉnh sửa mô tả</h4>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <FormGroup>
                        <Label>Mô tả README</Label>
                        <Input
                          type="textarea"
                          rows={6}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </FormGroup>
                      <Button color="primary">Cập nhật</Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Preview</h4>
                  </CardHeader>
                  <CardBody>
                    <p>{description}</p>
                    <ListGroup>
                      <ListGroupItem>✓ Tự động generate download link</ListGroupItem>
                      <ListGroupItem>✓ Checklist triển khai staging/production</ListGroupItem>
                      <ListGroupItem>✓ Database seed & script migration</ListGroupItem>
                    </ListGroup>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Card>
              <CardHeader>
                <h4 className="mb-0">Đơn hàng gần đây</h4>
              </CardHeader>
              <CardBody className="table-responsive">
                <Table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Người mua</th>
                      <th>Source</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const product = findProductById(order.productId);
                      if (!product) {
                        return null;
                      }
                      return (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>
                            <div>{order.buyer}</div>
                            <div className="text-muted small">{order.email}</div>
                          </td>
                          <td>{product.title}</td>
                          <td>
                            <div>${order.amount}</div>
                            <small className="text-muted">{order.method}</small>
                          </td>
                          <td>
                            <Badge color={order.status === "paid" ? "success" : "warning"}>
                              {order.status === "paid" ? "Đã xác nhận" : "Chờ xác nhận"}
                            </Badge>
                          </td>
                          <td className="text-right">
                            {order.status === "pending" ? (
                              <Button
                                color="info"
                                size="sm"
                                onClick={() => confirmOrder(order.id)}
                              >
                                Xác nhận
                              </Button>
                            ) : (
                              <span className="text-success small">Đã mở link tải</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Container>
        </div>
        <StoreFooter />
      </div>
    </>
  );
}

export default AdminDashboard;
