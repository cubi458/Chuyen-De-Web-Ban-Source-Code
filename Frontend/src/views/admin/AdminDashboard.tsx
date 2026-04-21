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
  Row,
  Table,
} from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import { apiRequest } from "lib/api";
import {
  findProductById,
  initialAdminOrders,
  sourceCategories,
} from "data/sourceCatalog";

type AdminProduct = {
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

function AdminDashboard() {
  const [orders, setOrders] = React.useState(initialAdminOrders);
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingProductId, setDeletingProductId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [newSource, setNewSource] = React.useState({
    title: "",
    price: "",
    categoryId: sourceCategories[0].id,
    techStack: "",
    repository: "",
  });
  const [description, setDescription] = React.useState("");
  const [zipFile, setZipFile] = React.useState<File | null>(null);
  const [zipName, setZipName] = React.useState("chua-chon");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    document.body.classList.add("admin-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    return () => {
      document.body.classList.remove("admin-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const result = await apiRequest<AdminProduct[]>("/admin/products", { method: "GET" }, true);
        setProducts(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Khong the tai danh sach san pham";
        setError(message);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const confirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "paid" } : order
      )
    );
  };

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newSource.title.trim()) {
      setError("Vui long nhap tieu de san pham");
      return;
    }

    if (!newSource.price || Number(newSource.price) < 0) {
      setError("Gia san pham khong hop le");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", newSource.title.trim());
      formData.append("price", String(Number(newSource.price)));
      formData.append("categoryId", newSource.categoryId);
      formData.append("techStack", newSource.techStack);
      formData.append("repository", newSource.repository);
      formData.append("description", description);
      if (zipFile) {
        formData.append("zipFile", zipFile);
      }

      const result = await apiRequest<{ success: boolean; product: AdminProduct }>(
        "/admin/products",
        {
          method: "POST",
          body: formData,
        },
        true
      );

      setProducts((prev) => [result.product, ...prev]);
      setSuccess("Them san pham thanh cong va da luu vao database.");
      setNewSource({
        title: "",
        price: "",
        categoryId: sourceCategories[0].id,
        techStack: "",
        repository: "",
      });
      setDescription("");
      setZipFile(null);
      setZipName("chua-chon");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Khong the them san pham";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    const confirmed = window.confirm(`Ban co chac chan muon xoa san pham "${product.title}"?`);
    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      setDeletingProductId(product.id);
      await apiRequest<{ success: boolean; message: string }>(
        `/admin/products/${product.id}`,
        { method: "DELETE" },
        true
      );
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setSuccess("Da xoa san pham thanh cong.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Khong the xoa san pham";
      setError(message);
    } finally {
      setDeletingProductId(null);
    }
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
                  Quản lý kho source code, thêm sản phẩm mới và upload file zip.
                </p>
              </Col>
            </Row>

            <Row>
              <Col lg="12">
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">Thêm sản phẩm mới</h4>
                  </CardHeader>
                  <CardBody>
                    <Form id="create-product-form" onSubmit={handleCreateProduct}>
                      {error && <div className="alert alert-danger">{error}</div>}
                      {success && <div className="alert alert-success">{success}</div>}

                      <div className="alert alert-info mb-4">
                        <strong>Cách upload:</strong> nhập thông tin sản phẩm, chọn file zip (nếu có), rồi bấm "Lưu sản phẩm".
                      </div>

                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>Tiêu đề</Label>
                            <Input
                              value={newSource.title}
                              onChange={(e) =>
                                setNewSource((prev) => ({ ...prev, title: e.target.value }))
                              }
                              disabled={submitting}
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
                              disabled={submitting}
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
                              disabled={submitting}
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
                              disabled={submitting}
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
                              disabled={submitting}
                              placeholder="https://github.com/..."
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      <FormGroup>
                        <Label>Mô tả sản phẩm</Label>
                        <Input
                          type="textarea"
                          rows={5}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={submitting}
                          placeholder="Mô tả tính năng chính, hướng dẫn cài đặt, thông tin hỗ trợ..."
                        />
                      </FormGroup>

                      <Row>
                        <Col md="12">
                          <FormGroup>
                            <Label>File sản phẩm (.zip)</Label>
                            <input
                              ref={fileInputRef}
                              className="d-none"
                              type="file"
                              accept=".zip"
                              disabled={submitting}
                              onChange={(e) => {
                                const selected = e.target.files?.[0] ?? null;
                                setZipFile(selected);
                                setZipName(selected?.name ?? "chua-chon");
                              }}
                            />
                            <div className="border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                <div className="mb-3 mb-md-0">
                                  <div className="font-weight-bold">{zipName === "chua-chon" ? "Chưa chọn file ZIP" : zipName}</div>
                                  <small className="text-muted">Định dạng hỗ trợ: .zip</small>
                                </div>
                                <div>
                                  <Button
                                    type="button"
                                    color="secondary"
                                    className="mr-2"
                                    disabled={submitting}
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    Chọn file ZIP
                                  </Button>
                                  <Button
                                    type="button"
                                    outline
                                    color="danger"
                                    disabled={submitting || zipName === "chua-chon"}
                                    onClick={() => {
                                      setZipFile(null);
                                      setZipName("chua-chon");
                                      if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                      }
                                    }}
                                  >
                                    Bỏ file
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>

                      <Button color="primary" size="lg" block type="submit" disabled={submitting}>
                        {submitting ? "Đang upload và lưu sản phẩm..." : "Lưu sản phẩm vào database"}
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Card>
              <CardHeader>
                <h4 className="mb-0">Sản phẩm đã lưu trong database</h4>
              </CardHeader>
              <CardBody className="table-responsive">
                {loadingProducts ? (
                  <div>Dang tai danh sach san pham...</div>
                ) : products.length === 0 ? (
                  <div className="text-muted">Chua co san pham nao trong database.</div>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Giá</th>
                        <th>Danh mục</th>
                        <th>ZIP</th>
                        <th>Ngày tạo</th>
                        <th className="text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div>{product.title}</div>
                            <small className="text-muted">{product.slug}</small>
                          </td>
                          <td>${product.price}</td>
                          <td>{product.categoryId}</td>
                          <td>{product.zipFileName || "Khong co"}</td>
                          <td>{product.createdAt ? new Date(product.createdAt).toLocaleString() : "-"}</td>
                          <td className="text-right">
                            <Button
                              color="danger"
                              size="sm"
                              disabled={deletingProductId === product.id}
                              onClick={() => handleDeleteProduct(product)}
                            >
                              {deletingProductId === product.id ? "Dang xoa..." : "Xoa"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>

            <Card className="mt-4">
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
