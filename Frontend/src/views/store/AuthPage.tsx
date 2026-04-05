import React from "react";
import {
  Alert,
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
} from "reactstrap";
import StoreNavbar from "components/Navbars/StoreNavbar";
import StoreFooter from "components/Footers/StoreFooter";
import { useAuth } from "context/AuthContext";
import { auth } from "lib/firebase";
import { FirebaseError } from "firebase/app";
import { useLocation, useNavigate } from "react-router-dom";
import { applyActionCode } from "firebase/auth";

type AuthStep = "login" | "register" | "verify";

function AuthPage() {
  const [step, setStep] = React.useState<AuthStep>("login");
  const {
    register: registerUser,
    login,
    sendVerificationEmail,
    user,
    loading: authLoading,
    isAdmin,
  } = useAuth();
  const [form, setForm] = React.useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [pendingVerifyEmail, setPendingVerifyEmail] = React.useState<string | null>(null);
  const [handlingAction, setHandlingAction] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    document.body.classList.add("auth-page");
    document.body.classList.add("sidebar-collapse");
    return () => {
      document.body.classList.remove("auth-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parseFirebaseError = (err: unknown) => {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/email-already-in-use":
          return "Email này đã được đăng ký.";
        case "auth/invalid-email":
          return "Email không hợp lệ.";
        case "auth/weak-password":
          return "Mật khẩu cần ít nhất 6 ký tự.";
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "Sai email hoặc mật khẩu.";
        default:
          return err.message;
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return "Đã xảy ra lỗi không xác định.";
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hash = window.location.hash || "";
    let queryString = "";

    if (hash.includes("?")) {
      queryString = hash.substring(hash.indexOf("?") + 1);
    } else if (window.location.search) {
      queryString = window.location.search.substring(1);
    }

    if (!queryString) {
      return;
    }

    const params = new URLSearchParams(queryString);
    const modeParam = params.get("mode");
    const oobCode = params.get("oobCode");

    if (modeParam !== "verifyEmail" || !oobCode) {
      return;
    }

    setHandlingAction(true);

    applyActionCode(auth, oobCode)
      .then(() => {
        setStep("login");
        setPendingVerifyEmail(null);
        setError(null);
        setSuccess("Email đã được xác thực. Vui lòng đăng nhập.");
      })
      .catch((err) => {
        setError(parseFirebaseError(err));
      })
      .finally(() => {
        setHandlingAction(false);
        const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#/store/auth`;
        window.history.replaceState(null, "", cleanUrl);
        navigate("/store/auth", { replace: true });
      });
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    try {
      setSubmitting(true);
      if (step === "register") {
        if (form.password !== form.confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp");
        }
        await registerUser({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
        });
        setPendingVerifyEmail(form.email);
        setSuccess("Đã gửi email xác thực. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản.");
        setStep("verify");
        setForm((prev) => ({
          displayName: prev.displayName,
          email: prev.email,
          password: "",
          confirmPassword: "",
        }));
      } else {
        await login({ email: form.email, password: form.password });
        setSuccess("Đăng nhập thành công.");
        setForm((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      }
    } catch (err) {
      const message = parseFirebaseError(err);
      setError(message);
      if (message.includes("Email chưa được xác thực")) {
        setPendingVerifyEmail(form.email);
        setStep("verify");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    resetMessages();
    try {
      setSubmitting(true);
      await sendVerificationEmail();
      setSuccess("Đã gửi lại email xác thực.");
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isUnverifiedUser = Boolean(user && !user.emailVerified);

  React.useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      return;
    }

    if (!user.emailVerified) {
      return;
    }

    if (isAdmin) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/store", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  return (
    <>
      <StoreNavbar />
      <div className="wrapper">
        <div className="section section-signup">
          <Container>
            <Row className="justify-content-center">
              <Col lg="6" md="8">
                <Card className="card-signup">
                  <CardHeader className="text-center">
                    <h3 className="title mb-2">
                      {step === "login"
                        ? "Đăng nhập"
                        : step === "register"
                        ? "Đăng ký"
                        : "Xác thực email"}
                    </h3>
                    {step !== "verify" && (
                      <div className="btn-group btn-group-sm">
                        <Button
                          color={step === "login" ? "info" : "default"}
                          onClick={() => setStep("login")}
                          disabled={submitting}
                        >
                          Đăng nhập
                        </Button>
                        <Button
                          color={step === "register" ? "info" : "default"}
                          onClick={() => setStep("register")}
                          disabled={submitting}
                        >
                          Đăng ký
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardBody>
                    {error && (
                      <Alert color="danger" toggle={() => setError(null)}>
                        {error}
                      </Alert>
                    )}
                    {success && (
                      <Alert color="success" toggle={() => setSuccess(null)}>
                        {success}
                      </Alert>
                    )}
                    {(isUnverifiedUser || location.state?.blocked) && step !== "verify" && (
                      <Alert color="warning">
                        Email chưa được xác thực nên chưa thể truy cập trang quản trị. Kiểm tra hộp thư hoặc
                        <Button
                          color="link"
                          className="p-0 ml-1"
                          onClick={handleResendVerification}
                          disabled={submitting}
                        >
                          gửi lại email xác thực
                        </Button>
                        .
                      </Alert>
                    )}
                    {step === "verify" ? (
                      <div className="text-center">
                        <p>
                          Đã gửi email xác thực tới <strong>{pendingVerifyEmail}</strong>.<br />
                          Vui lòng mở hộp thư và nhấn vào liên kết kích hoạt tài khoản.
                        </p>
                        <p className="text-muted small mb-4">
                          Sau khi hoàn tất xác thực, trang sẽ tự chuyển về mục đăng nhập để bạn tiếp tục.
                          Nếu không thấy email, hãy kiểm tra Spam hoặc liên hệ quản trị viên.
                        </p>
                        {handlingAction && <div>Đang xác nhận liên kết...</div>}
                      </div>
                    ) : (
                      <Form onSubmit={handleSubmit}>
                        {step === "register" && (
                          <FormGroup>
                            <Label>Họ tên</Label>
                            <Input
                              name="displayName"
                              placeholder="Tên đầy đủ"
                              value={form.displayName}
                              onChange={handleChange}
                              disabled={submitting}
                            />
                          </FormGroup>
                        )}
                        <FormGroup>
                          <Label>Email</Label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>Mật khẩu</Label>
                          <Input
                            name="password"
                            type="password"
                            placeholder="••••••"
                            value={form.password}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                          />
                        </FormGroup>
                        {step === "register" && (
                          <FormGroup>
                            <Label>Xác nhận mật khẩu</Label>
                            <Input
                              name="confirmPassword"
                              type="password"
                              placeholder="Nhập lại"
                              value={form.confirmPassword}
                              onChange={handleChange}
                              disabled={submitting}
                              required
                            />
                          </FormGroup>
                        )}
                        <Button color="info" block className="mt-3" type="submit" disabled={submitting}>
                          {submitting
                            ? "Đang xử lý..."
                            : step === "login"
                            ? "Đăng nhập"
                            : "Tạo tài khoản"}
                        </Button>
                      </Form>
                    )}
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

export default AuthPage;
