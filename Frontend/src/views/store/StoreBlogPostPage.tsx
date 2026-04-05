import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import { findStoreBlogPostById } from "views/store/data/storeBlogPosts";

function StoreBlogPostPage() {
  const { id } = useParams();
  const post = React.useMemo(() => findStoreBlogPostById(id), [id]);

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

  if (!post) {
    return (
      <>
        <StoreNavbar />
        <div className="wrapper">
          <div className="section">
            <Container>
              <Card>
                <CardBody>
                  <h3 className="title mb-2">Không tìm thấy bài viết</h3>
                  <p className="description mb-3">
                    Bài viết này không tồn tại hoặc đã được đổi đường dẫn.
                  </p>
                  <Button color="info" className="btn-round" tag={Link} to="/store/blog">
                    Quay lại Blog
                  </Button>
                </CardBody>
              </Card>
            </Container>
          </div>
          <StoreFooter />
        </div>
      </>
    );
  }

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="page-header page-header-small">
          <div
            className="page-header-image"
            style={{
              backgroundImage: "url(" + require("assets/img/bg8.jpg") + ")",
              filter: "brightness(0.45)",
            }}
          ></div>
          <div className="content-center">
            <Container>
              <Row className="align-items-center">
                <Col md="8">
                  <h1 className="title text-white">{post.title}</h1>
                  <div className="mb-3">
                    {post.tags.map((tag) => (
                      <Badge color="default" className="mr-1" key={tag}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <small className="text-white">
                    {post.dateLabel} • {post.readTimeLabel}
                  </small>
                </Col>
                <Col md="4" className="text-md-right text-center">
                  <Button color="neutral" outline size="lg" tag={Link} to="/store/blog">
                    Trở lại Blog
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
        </div>

        <div className="section">
          <Container>
            <Row>
              <Col lg="8">
                <Card className="mb-4">
                  <CardBody>
                    {post.sections.map((section, index) => (
                      <div key={`${post.id}-section-${index}`} className={index === 0 ? "" : "mt-4"}>
                        <h3 className="title mb-3 text-left">{section.heading}</h3>

                        {section.paragraphs.map((paragraph, pIndex) => (
                          <p key={`${post.id}-p-${index}-${pIndex}`} className="mb-3">
                            {paragraph}
                          </p>
                        ))}

                        {section.bullets && section.bullets.length > 0 && (
                          <ListGroup className="mb-3">
                            {section.bullets.map((bullet) => (
                              <ListGroupItem key={`${post.id}-b-${index}-${bullet}`} className="border-0 px-0">
                                <i className="now-ui-icons ui-1_check mr-2 text-success"></i>
                                {bullet}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        )}
                      </div>
                    ))}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h4 className="title mb-0 text-left" style={{ paddingLeft: '15px' }}>Tin tức mới</h4>
                  </CardHeader>
                  <CardBody>
                    <p className="description mb-3 text-left">
                      Hi vọng tin tức trên có thể giúp ích cho bạn. Hãy theo dõi blog của chúng tôi để cập nhật thêm tin tức hữu ích
                    </p>
                    <Button color="default" className="btn-round" tag={Link} to="/store/blog">
                      Xem thêm bài viết
                    </Button>
                  </CardBody>
                </Card>
              </Col>

              <Col lg="4">
                <Card className="mb-4">
                  <CardHeader>
                    <h5 className="title mb-0 text-left" style={{ paddingLeft: '35px' }}>Tóm tắt</h5>
                  </CardHeader>
                  <CardBody className="">
                    <ListGroup flush className="text-left d-inline-block">
                      <ListGroupItem>
                        <strong>Chủ đề:</strong>
                        <div>{post.tags.join(", ")}</div>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Thời gian đọc:</strong>
                        <div>{post.readTimeLabel}</div>
                      </ListGroupItem>
                      <ListGroupItem>
                        <strong>Năm:</strong>
                        <div>{post.dateLabel}</div>
                      </ListGroupItem>
                    </ListGroup>
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

export default StoreBlogPostPage;

