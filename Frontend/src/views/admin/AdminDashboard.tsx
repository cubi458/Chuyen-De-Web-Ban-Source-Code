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
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import { apiRequest } from "lib/api";
import {
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
  coverImagePath?: string;
  detailImagePaths?: string;
  zipFileName?: string;
  createdAt?: string;
};

type AdminOrderItem = {
  id: string;
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
  license: string;
};

type AdminOrder = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: AdminOrderItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  status: "pending" | "paid" | "cancelled";
  note?: string;
  createdAt: string;
};

function AdminDashboard() {
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [loadingOrders, setLoadingOrders] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingProductId, setDeletingProductId] = React.useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = React.useState<string | null>(null);
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);
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
  const [coverImage, setCoverImage] = React.useState<File | null>(null);
  const [coverName, setCoverName] = React.useState("chua-chon");
  const [detailImages, setDetailImages] = React.useState<File[]>([]);
  const [detailNames, setDetailNames] = React.useState<string[]>([]);
  const [editSource, setEditSource] = React.useState({
    title: "",
    price: "",
    categoryId: sourceCategories[0].id,
    techStack: "",
    repository: "",
  });
  const [editDescription, setEditDescription] = React.useState("");
  const [editZipFile, setEditZipFile] = React.useState<File | null>(null);
  const [editZipName, setEditZipName] = React.useState("chua-chon");
  const [editCoverImage, setEditCoverImage] = React.useState<File | null>(null);
  const [editCoverName, setEditCoverName] = React.useState("chua-chon");
  const [editDetailImages, setEditDetailImages] = React.useState<File[]>([]);
  const [editDetailNames, setEditDetailNames] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement | null>(null);
  const detailInputRef = React.useRef<HTMLInputElement | null>(null);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const editCoverInputRef = React.useRef<HTMLInputElement | null>(null);
  const editDetailInputRef = React.useRef<HTMLInputElement | null>(null);

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

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const result = await apiRequest<AdminOrder[]>('/admin/orders', { method: 'GET' }, true);
        setOrders(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Khong the tai danh sach don hang';
        setError(message);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  const confirmOrder = async (orderId: string) => {
    setError(null);
    setSuccess(null);

    try {
      setConfirmingOrderId(orderId);
      const updated = await apiRequest<AdminOrder>(
        `/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "paid" }),
        },
        true
      );
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)));
      setSuccess(`Đã xác nhận thanh toán cho đơn ${orderId}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Khong the xac nhan don hang";
      setError(message);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
  };

  const resolveProductName = (productId: string, storedTitle: string): string => {
    // First try to find from loaded products
    const product = products.find(p => p.id === productId);
    if (product) {
      return product.title;
    }
    // Fall back to stored title if product not found
    if (storedTitle && storedTitle.trim()) {
      return storedTitle;
    }
    return productId;
  };

  const renderOrderSources = (order: AdminOrder) => {
    if (order.items.length === 0) {
      return "Không có sản phẩm";
    }

    const firstItemName = resolveProductName(
      order.items[0].productId,
      order.items[0].productTitle
    );

    if (order.items.length === 1) {
      return firstItemName;
    }

    return `${firstItemName} +${order.items.length - 1}`;
  };

  const resetForm = () => {
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
    setCoverImage(null);
    setCoverName("chua-chon");
    setDetailImages([]);
    setDetailNames([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
    if (detailInputRef.current) {
      detailInputRef.current.value = "";
    }
  };

  const resetEditForm = () => {
    setEditingProductId(null);
    setEditSource({
      title: "",
      price: "",
      categoryId: sourceCategories[0].id,
      techStack: "",
      repository: "",
    });
    setEditDescription("");
    setEditZipFile(null);
    setEditZipName("chua-chon");
    setEditCoverImage(null);
    setEditCoverName("chua-chon");
    setEditDetailImages([]);
    setEditDetailNames([]);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    if (editCoverInputRef.current) {
      editCoverInputRef.current.value = "";
    }
    if (editDetailInputRef.current) {
      editDetailInputRef.current.value = "";
    }
  };

  const startEditProduct = (product: AdminProduct) => {
    setEditingProductId(product.id);
    setEditSource({
      title: product.title || "",
      price: String(product.price ?? ""),
      categoryId: product.categoryId || sourceCategories[0].id,
      techStack: product.techStack || "",
      repository: product.repository || "",
    });
    setEditDescription(product.description || "");
    setEditZipFile(null);
    setEditZipName(product.zipFileName || "chua-chon");
    setEditCoverImage(null);
    setEditCoverName(product.coverImagePath ? "Dang dung" : "chua-chon");
    setEditDetailImages([]);
    setEditDetailNames(product.detailImagePaths ? ["Dang dung"] : []);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    if (editCoverInputRef.current) {
      editCoverInputRef.current.value = "";
    }
    if (editDetailInputRef.current) {
      editDetailInputRef.current.value = "";
    }
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
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      if (detailImages.length > 0) {
        detailImages.forEach((file) => {
          formData.append("detailImages", file);
        });
      }
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
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Khong the luu san pham";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

    const handleUpdateProduct = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!editingProductId) {
        return;
      }
      setError(null);
      setSuccess(null);

      if (!editSource.title.trim()) {
        setError("Vui long nhap tieu de san pham");
        return;
      }

      if (!editSource.price || Number(editSource.price) < 0) {
        setError("Gia san pham khong hop le");
        return;
      }

      try {
        setSubmitting(true);
        const formData = new FormData();
        formData.append("title", editSource.title.trim());
        formData.append("price", String(Number(editSource.price)));
        formData.append("categoryId", editSource.categoryId);
        formData.append("techStack", editSource.techStack);
        formData.append("repository", editSource.repository);
        formData.append("description", editDescription);
        if (editCoverImage) {
          formData.append("coverImage", editCoverImage);
        }
        if (editDetailImages.length > 0) {
          editDetailImages.forEach((file) => {
            formData.append("detailImages", file);
          });
        }
        if (editZipFile) {
          formData.append("zipFile", editZipFile);
        }

        const result = await apiRequest<{ success: boolean; product: AdminProduct }>(
          `/admin/products/${editingProductId}`,
          {
            method: "PATCH",
            body: formData,
          },
          true
        );
        setProducts((prev) =>
          prev.map((item) => (item.id === editingProductId ? result.product : item))
        );
        setSuccess("Da cap nhat san pham thanh cong.");
        resetEditForm();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Khong the luu san pham";
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
                        <strong>Cách upload:</strong> nhập thông tin sản phẩm, chọn ảnh/zip (nếu có), rồi bấm
                        {" "}
                        "Lưu sản phẩm".
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
                        <Col md="6">
                          <FormGroup>
                            <Label>Ảnh bìa (cover)</Label>
                            <input
                              ref={coverInputRef}
                              className="d-none"
                              type="file"
                              accept="image/*"
                              disabled={submitting}
                              onChange={(e) => {
                                const selected = e.target.files?.[0] ?? null;
                                setCoverImage(selected);
                                setCoverName(selected?.name ?? "chua-chon");
                              }}
                            />
                            <div className="border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                <div className="mb-3 mb-md-0">
                                  <div className="font-weight-bold">
                                    {coverName === "chua-chon" ? "Chưa chọn ảnh bìa" : coverName}
                                  </div>
                                  <small className="text-muted">Định dạng: JPG, PNG, WebP</small>
                                </div>
                                <div>
                                  <Button
                                    type="button"
                                    color="secondary"
                                    className="mr-2"
                                    disabled={submitting}
                                    onClick={() => coverInputRef.current?.click()}
                                  >
                                    Chọn ảnh bìa
                                  </Button>
                                  <Button
                                    type="button"
                                    outline
                                    color="danger"
                                    disabled={submitting || coverName === "chua-chon"}
                                    onClick={() => {
                                      setCoverImage(null);
                                      setCoverName("chua-chon");
                                      if (coverInputRef.current) {
                                        coverInputRef.current.value = "";
                                      }
                                    }}
                                  >
                                    Bỏ ảnh
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label>Ảnh chi tiết (nhiều ảnh)</Label>
                            <input
                              ref={detailInputRef}
                              className="d-none"
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={submitting}
                              onChange={(e) => {
                                const selected = Array.from(e.target.files ?? []);
                                setDetailImages(selected);
                                setDetailNames(selected.map((file) => file.name));
                              }}
                            />
                            <div className="border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                <div className="mb-3 mb-md-0">
                                  <div className="font-weight-bold">
                                    {detailNames.length === 0
                                      ? "Chưa chọn ảnh chi tiết"
                                      : `${detailNames.length} ảnh đã chọn`}
                                  </div>
                                  {detailNames.length > 0 && (
                                    <small className="text-muted">
                                      {detailNames.slice(0, 2).join(", ")}
                                      {detailNames.length > 2 ? "..." : ""}
                                    </small>
                                  )}
                                </div>
                                <div>
                                  <Button
                                    type="button"
                                    color="secondary"
                                    className="mr-2"
                                    disabled={submitting}
                                    onClick={() => detailInputRef.current?.click()}
                                  >
                                    Chọn ảnh chi tiết
                                  </Button>
                                  <Button
                                    type="button"
                                    outline
                                    color="danger"
                                    disabled={submitting || detailNames.length === 0}
                                    onClick={() => {
                                      setDetailImages([]);
                                      setDetailNames([]);
                                      if (detailInputRef.current) {
                                        detailInputRef.current.value = "";
                                      }
                                    }}
                                  >
                                    Bỏ ảnh
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>

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
                        {submitting ? "Đang lưu sản phẩm..." : "Lưu sản phẩm vào database"}
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
                              color="info"
                              size="sm"
                              className="mr-2"
                              disabled={submitting}
                              onClick={() => startEditProduct(product)}
                            >
                              Sửa
                            </Button>
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

            <Modal isOpen={Boolean(editingProductId)} toggle={resetEditForm} size="lg">
              <ModalHeader toggle={resetEditForm}>Sửa sản phẩm</ModalHeader>
              <ModalBody>
                <Form id="edit-product-form" onSubmit={handleUpdateProduct}>
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Tiêu đề</Label>
                        <Input
                          value={editSource.title}
                          onChange={(e) =>
                            setEditSource((prev) => ({ ...prev, title: e.target.value }))
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
                          value={editSource.price}
                          onChange={(e) =>
                            setEditSource((prev) => ({ ...prev, price: e.target.value }))
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
                          value={editSource.categoryId}
                          onChange={(e) =>
                            setEditSource((prev) => ({ ...prev, categoryId: e.target.value }))
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
                          value={editSource.techStack}
                          onChange={(e) =>
                            setEditSource((prev) => ({ ...prev, techStack: e.target.value }))
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
                          value={editSource.repository}
                          onChange={(e) =>
                            setEditSource((prev) => ({ ...prev, repository: e.target.value }))
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
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      disabled={submitting}
                      placeholder="Mô tả tính năng chính, hướng dẫn cài đặt, thông tin hỗ trợ..."
                    />
                  </FormGroup>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Ảnh bìa (cover)</Label>
                        <input
                          ref={editCoverInputRef}
                          className="d-none"
                          type="file"
                          accept="image/*"
                          disabled={submitting}
                          onChange={(e) => {
                            const selected = e.target.files?.[0] ?? null;
                            setEditCoverImage(selected);
                            setEditCoverName(selected?.name ?? "chua-chon");
                          }}
                        />
                        <div className="border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                            <div className="mb-3 mb-md-0">
                              <div className="font-weight-bold">
                                {editCoverName === "chua-chon" ? "Chưa chọn ảnh bìa" : editCoverName}
                              </div>
                              <small className="text-muted">Định dạng: JPG, PNG, WebP</small>
                            </div>
                            <div>
                              <Button
                                type="button"
                                color="secondary"
                                className="mr-2"
                                disabled={submitting}
                                onClick={() => editCoverInputRef.current?.click()}
                              >
                                Chọn ảnh bìa
                              </Button>
                              <Button
                                type="button"
                                outline
                                color="danger"
                                disabled={submitting || editCoverName === "chua-chon"}
                                onClick={() => {
                                  setEditCoverImage(null);
                                  setEditCoverName("chua-chon");
                                  if (editCoverInputRef.current) {
                                    editCoverInputRef.current.value = "";
                                  }
                                }}
                              >
                                Bỏ ảnh
                              </Button>
                            </div>
                          </div>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Ảnh chi tiết (nhiều ảnh)</Label>
                        <input
                          ref={editDetailInputRef}
                          className="d-none"
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={submitting}
                          onChange={(e) => {
                            const selected = Array.from(e.target.files ?? []);
                            setEditDetailImages(selected);
                            setEditDetailNames(selected.map((file) => file.name));
                          }}
                        />
                        <div className="border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                            <div className="mb-3 mb-md-0">
                              <div className="font-weight-bold">
                                {editDetailNames.length === 0
                                  ? "Chưa chọn ảnh chi tiết"
                                  : `${editDetailNames.length} ảnh đã chọn`}
                              </div>
                              {editDetailNames.length > 0 && (
                                <small className="text-muted">
                                  {editDetailNames.slice(0, 2).join(", ")}
                                  {editDetailNames.length > 2 ? "..." : ""}
                                </small>
                              )}
                            </div>
                            <div>
                              <Button
                                type="button"
                                color="secondary"
                                className="mr-2"
                                disabled={submitting}
                                onClick={() => editDetailInputRef.current?.click()}
                              >
                                Chọn ảnh chi tiết
                              </Button>
                              <Button
                                type="button"
                                outline
                                color="danger"
                                disabled={submitting || editDetailNames.length === 0}
                                onClick={() => {
                                  setEditDetailImages([]);
                                  setEditDetailNames([]);
                                  if (editDetailInputRef.current) {
                                    editDetailInputRef.current.value = "";
                                  }
                                }}
                              >
                                Bỏ ảnh
                              </Button>
                            </div>
                          </div>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <Label>File sản phẩm (.zip)</Label>
                        <input
                          ref={editFileInputRef}
                          className="d-none"
                          type="file"
                          accept=".zip"
                          disabled={submitting}
                          onChange={(e) => {
                            const selected = e.target.files?.[0] ?? null;
                            setEditZipFile(selected);
                            setEditZipName(selected?.name ?? "chua-chon");
                          }}
                        />
                        <div className="border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                            <div className="mb-3 mb-md-0">
                              <div className="font-weight-bold">
                                {editZipName === "chua-chon" ? "Chưa chọn file ZIP" : editZipName}
                              </div>
                              <small className="text-muted">Định dạng hỗ trợ: .zip</small>
                            </div>
                            <div>
                              <Button
                                type="button"
                                color="secondary"
                                className="mr-2"
                                disabled={submitting}
                                onClick={() => editFileInputRef.current?.click()}
                              >
                                Chọn file ZIP
                              </Button>
                              <Button
                                type="button"
                                outline
                                color="danger"
                                disabled={submitting || editZipName === "chua-chon"}
                                onClick={() => {
                                  setEditZipFile(null);
                                  setEditZipName("chua-chon");
                                  if (editFileInputRef.current) {
                                    editFileInputRef.current.value = "";
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

                  <Row>
                    <Col md="8">
                      <Button color="primary" size="lg" block type="submit" disabled={submitting}>
                        {submitting ? "Đang lưu sản phẩm..." : "Cập nhật sản phẩm"}
                      </Button>
                    </Col>
                    <Col md="4" className="mt-2 mt-md-0">
                      <Button
                        color="secondary"
                        outline
                        size="lg"
                        block
                        type="button"
                        disabled={submitting}
                        onClick={resetEditForm}
                      >
                        Đóng
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </ModalBody>
            </Modal>

            <Card className="mt-4">
              <CardHeader>
                <h4 className="mb-0">Đơn hàng gần đây</h4>
              </CardHeader>
              <CardBody className="table-responsive">
                {loadingOrders ? (
                  <div>Dang tai danh sach don hang...</div>
                ) : orders.length === 0 ? (
                  <div className="text-muted">Chua co don hang nao trong database.</div>
                ) : (
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
                      return (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>
                            <div>{order.userName}</div>
                            <div className="text-muted small">{order.userEmail}</div>
                            <div className="text-muted small">{formatDate(order.createdAt)}</div>
                          </td>
                          <td>{renderOrderSources(order)}</td>
                          <td>
                            <div>${order.total}</div>
                            <small className="text-muted">{order.paymentMethod}</small>
                          </td>
                          <td>
                            <Badge color={order.status === "paid" ? "success" : order.status === "cancelled" ? "danger" : "warning"}>
                              {order.status === "paid" ? "Đã xác nhận" : order.status === "cancelled" ? "Đã hủy" : "Chờ xác nhận"}
                            </Badge>
                          </td>
                          <td className="text-right">
                            {order.status === "pending" ? (
                              <Button
                                color="info"
                                size="sm"
                                onClick={() => confirmOrder(order.id)}
                                disabled={confirmingOrderId === order.id}
                              >
                                {confirmingOrderId === order.id ? "Đang xác nhận..." : "Xác nhận"}
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
                )}
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
