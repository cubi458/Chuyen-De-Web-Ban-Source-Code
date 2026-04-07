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
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Row,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import {
  languageFilters,
  priceFilters,
  projectTypes,
  sourceCategories,
  sourceProducts,
} from "data/sourceCatalog";
import heroBackground from "assets/img/bg8.jpg";
import valueIllustration from "assets/img/Trang nen, anh gioi thieu, quang cao/top-code.jpg";
import { Chat } from "features/chat/components";
import { useCart } from "context/CartContext";

function HomePage() {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [language, setLanguage] = React.useState(languageFilters[0]);
  const [priceRange, setPriceRange] = React.useState(priceFilters[0].id);
  const [projectType, setProjectType] = React.useState(projectTypes[0]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(
    sourceCategories[0]?.id ?? null
  );
  const categoryProductsRef = React.useRef<HTMLDivElement | null>(null);
  const [cartFeedback, setCartFeedback] = React.useState<string | null>(null);

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

  const matchSearch = (value: string) =>
    value.toLowerCase().includes(searchTerm.toLowerCase());

  const matchLanguage = (languages: string[]) =>
    language === languageFilters[0] || languages.includes(language);

  const matchProject = (type: string) =>
    projectType === projectTypes[0] || type === projectType;

  const matchPrice = (price: number) => {
    switch (priceRange) {
      case "under50":
        return price < 50;
      case "50-100":
        return price >= 50 && price <= 100;
      case "100plus":
        return price > 100;
      default:
        return true;
    }
  };

  const filteredProducts = sourceProducts.filter((product) =>
    [
      product.title,
      product.summary,
      product.technologies.join(" "),
      product.projectType,
    ].some((value) => matchSearch(value)) &&
    matchLanguage(product.languages) &&
    matchProject(product.projectType) &&
    matchPrice(product.price)
  );

  const selectedCategory = React.useMemo(
    () =>
      selectedCategoryId
        ? sourceCategories.find((category) => category.id === selectedCategoryId) ?? null
        : null,
    [selectedCategoryId]
  );

  const selectedCategoryProducts = React.useMemo(
    () =>
      selectedCategoryId
        ? sourceProducts.filter((product) => product.categoryId === selectedCategoryId)
        : [],
    [selectedCategoryId]
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    window.requestAnimationFrame(() => {
      if (categoryProductsRef.current) {
        categoryProductsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const handleAddProductToCart = async (productId: string) => {
    const result = await addToCart(productId);
    setCartFeedback(result.message);
  };

  React.useEffect(() => {
    if (!cartFeedback) {
      return;
    }
    const timer = window.setTimeout(() => setCartFeedback(null), 2500);
    return () => window.clearTimeout(timer);
  }, [cartFeedback]);

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="page-header page-header-small">
          <div
            className="page-header-image"
            style={{
              backgroundImage: `url(${heroBackground})`,
              filter: "brightness(0.5)",
            }}
          ></div>
          <div className="content-center">
            <Container>
              <h1 className="title text-white">
                Source code thương mại hóa
              </h1>
              <p className="text-white">
                Tìm kiếm, lọc và khám phá những bộ source code chất lượng cho
                startup, agency hay cá nhân.
              </p>
              <Row className="mt-4 hero-filter-row align-items-center">
                <Col md="5" lg="5">
                  <InputGroup>
                    <Input
                      className="hero-filter-control"
                      placeholder="Từ khóa, công nghệ, loại dự án..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>
                        <i className="now-ui-icons ui-1_zoom-bold"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Input
                      type="select"
                      className="hero-filter-control"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {languageFilters.map((lang) => (
                        <option key={lang}>{lang}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="2" className="hero-filter-col hero-filter-col--price">
                  <FormGroup>
                    <Input
                      type="select"
                      className="hero-filter-control"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                    >
                      {priceFilters.map((range) => (
                        <option key={range.id} value={range.id}>
                          {range.label}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Input
                      type="select"
                      className="hero-filter-control"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                    >
                      {projectTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </Container>
          </div>
        </div>

        <div className="section">
          <Container>
            {cartFeedback && (
              <Alert
                color="success"
                toggle={() => setCartFeedback(null)}
                className="sticky-feedback"
              >
                {cartFeedback}
              </Alert>
            )}
            <div className="featured-header d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
              <div className="flex-grow-1">
                <h2 className="title mb-0 featured-heading">Source code nổi bật</h2>
                <p className="category text-muted mb-0">
                  {filteredProducts.length} sản phẩm phù hợp tiêu chí
                </p>
              </div>
              <Button color="info" tag={Link} to="/store/catalog" className="mt-3 mt-md-0">
                Xem tất cả
              </Button>
            </div>
            <Row>
              {filteredProducts.map((product) => (
                <Col lg="4" md="6" className="mb-4" key={product.id}>
                  <Card className="card-product">
                    <div
                      className="card-image"
                      style={{
                        height: 180,
                        backgroundImage: `url(${product.coverImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                    <CardBody>
                      <Badge color="info" className="mb-2">
                        {product.projectType}
                      </Badge>
                      <CardTitle tag="h4">{product.title}</CardTitle>
                      <p className="card-description">{product.summary}</p>
                      <div className="mb-2">
                        {product.technologies.map((tech) => (
                          <Badge color="default" className="mr-1" key={tech}>
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardBody>
                    <CardFooter className="d-flex justify-content-between align-items-center">
                      <span className="h4 mb-0">${product.price}</span>
                      <div className="d-flex">
                        <Button
                          color="default"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleAddProductToCart(product.id)}
                        >
                          Thêm vào giỏ
                        </Button>
                        <Button
                          color="info"
                          size="sm"
                          tag={Link}
                          to={`/store/source/${product.id}`}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </div>

        <div className="section section-basic">
          <Container>
            <Row className="mb-4 align-items-center">
              <Col md="8">
                <h3 className="title">Chủ đề phổ biến</h3>
                <p className="category">
                  Lọc nhanh theo use-case: Web, Mobile, AI/ML,...
                </p>
              </Col>
              <Col md="4" className="text-md-right">
                <Button color="primary" tag={Link} to="/store/catalog">
                  Khám phá danh mục
                </Button>
              </Col>
            </Row>
            <Row>
              {sourceCategories.map((category) => {
                const isActive = category.id === selectedCategoryId;
                return (
                  <Col lg="4" md="6" className="mb-4" key={category.id}>
                    <Card
                      className={`card-plain border popular-category-card ${
                        isActive ? "popular-category-card--active" : ""
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleCategorySelect(category.id);
                        }
                      }}
                    >
                      <CardBody>
                        <div className="d-flex align-items-start">
                          <div className={`icon icon-${category.color} mr-3`}>
                            <i className={category.icon}></i>
                          </div>
                          <div>
                            <CardTitle tag="h4">{category.name}</CardTitle>
                            <p className="card-description">
                              {category.description}
                            </p>
                            <div>
                              {category.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  color="default"
                                  className="mr-1 mb-1"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            {selectedCategory && (
              <div className="category-products-panel" ref={categoryProductsRef}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                  <div>
                    <h4 className="mb-1">{selectedCategory.name}</h4>
                    <p className="text-muted mb-0">
                      {selectedCategoryProducts.length > 0
                        ? `${selectedCategoryProducts.length} source code trong danh mục này`
                        : "Đang cập nhật thêm sản phẩm cho danh mục này"}
                    </p>
                  </div>
                  <Button
                    color="link"
                    className="px-0 mt-3 mt-md-0"
                    tag={Link}
                    to="/store/catalog"
                  >
                    Xem toàn bộ danh mục
                    <i className="now-ui-icons arrows-1_minimal-right ml-2"></i>
                  </Button>
                </div>
                {selectedCategoryProducts.length > 0 ? (
                  <Row className="category-product-grid">
                    {selectedCategoryProducts.slice(0, 6).map((product) => (
                      <Col lg="4" md="6" className="mb-4" key={product.id}>
                        <Card className="card-product h-100">
                          <div
                            className="card-image"
                            style={{
                              height: 160,
                              backgroundImage: `url(${product.coverImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          ></div>
                          <CardBody>
                            <Badge color="info" className="mb-2">
                              {product.projectType}
                            </Badge>
                            <CardTitle tag="h4">{product.title}</CardTitle>
                            <p className="card-description">{product.summary}</p>
                            <div className="mb-2">
                              {product.technologies.slice(0, 3).map((tech) => (
                                <Badge color="default" className="mr-1" key={`${product.id}-${tech}`}>
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </CardBody>
                          <CardFooter className="d-flex justify-content-between align-items-center">
                            <span className="h5 mb-0">${product.price}</span>
                            <div className="d-flex">
                              <Button
                                color="default"
                                size="sm"
                                className="mr-2"
                                onClick={() => handleAddProductToCart(product.id)}
                              >
                                Thêm vào giỏ
                              </Button>
                              <Button
                                color="info"
                                size="sm"
                                tag={Link}
                                to={`/store/source/${product.id}`}
                              >
                                Xem chi tiết
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Card className="card-plain border">
                    <CardBody>
                      <p className="mb-0">
                        Hiện chưa có source code nào cho danh mục này. Vui lòng thử lại
                        sau hoặc khám phá danh mục khác.
                      </p>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </Container>
        </div>

        <div className="section section-nucleo-icons">
          <Container>
            <Row className="align-items-center">
              <Col md="6">
                <h3 className="title">Tăng tốc go-to-market</h3>
                <p>
                  Các gói source code đi kèm tài liệu triển khai, database seed,
                  checklist release, giúp đội ngũ technical tiết kiệm hàng tuần
                  phát triển.
                </p>
                <ul className="list-unstyled">
                  <li>
                    <i className="now-ui-icons business_money-coins mr-2"></i>
                    License linh hoạt cho agency/freelancer
                  </li>
                  <li>
                    <i className="now-ui-icons files_single-copy-04 mr-2"></i>
                    README kỹ càng, kèm quickstart script
                  </li>
                  <li>
                    <i className="now-ui-icons tech_tv mr-2"></i>
                    Demo video & assets để pitching cho khách hàng
                  </li>
                </ul>
              </Col>
              <Col md="6">
                <img
                  alt="store hero"
                  className="img-raised rounded img-fluid"
                  src={valueIllustration}
                />
              </Col>
            </Row>
          </Container>
        </div>
        <div className="chat-float">
          <Chat title="Hỗ trợ" placeholder="Gõ tin nhắn..." />
        </div>
        <StoreFooter />
      </div>
    </>
  );
}

export default HomePage;
