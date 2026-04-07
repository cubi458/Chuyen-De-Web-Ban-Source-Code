import React from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { apiRequest, getToken } from "lib/api";
import { useAuth } from "context/AuthContext";

type Review = {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string | null;
};

type ReviewSectionProps = {
  productId: string;
};

const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}> = ({ rating, onRatingChange, readonly = false }) => {
  return (
    <div className="d-inline-flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            cursor: readonly ? "default" : "pointer",
            fontSize: "1.25rem",
            color: rating >= star ? "#ffc107" : "#e4e5e9",
            marginRight: 4,
          }}
          onClick={() => !readonly && onRatingChange?.(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "danger"; message: string } | null>(null);

  const loadReviews = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiRequest<Review[]>(`/reviews?productId=${encodeURIComponent(productId)}`, { method: "GET" });
      setReviews(list);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getToken() || !user) {
      setFeedback({ type: "danger", message: "Ban can dang nhap de danh gia" });
      return;
    }

    if (!comment.trim()) {
      setFeedback({ type: "danger", message: "Vui long nhap noi dung danh gia" });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest(
        "/reviews",
        {
          method: "POST",
          body: JSON.stringify({ productId, rating, comment }),
        },
        true
      );
      setComment("");
      setRating(5);
      setFeedback({ type: "success", message: "Danh gia cua ban da duoc gui" });
      await loadReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      setFeedback({ type: "danger", message: "Khong the gui danh gia" });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <Card className="mt-4 shadow-sm border-0">
      <CardHeader className="bg-white border-0 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Đánh giá & Bình luận</h4>
        <Badge color="light" className="text-muted px-3 py-2">
          {reviews.length} đánh giá | {averageRating.toFixed(1)} ★
        </Badge>
      </CardHeader>
      <CardBody>
        {feedback && (
          <Alert color={feedback.type} toggle={() => setFeedback(null)} className="mb-3">
            {feedback.message}
          </Alert>
        )}

        {user ? (
          <Form onSubmit={handleSubmitReview} className="mb-4 p-3 bg-light rounded">
            <FormGroup>
              <Label>Đánh giá sao</Label>
              <div>
                <StarRating rating={rating} onRatingChange={setRating} />
              </div>
            </FormGroup>
            <FormGroup>
              <Label>Nội dung đánh giá</Label>
              <Input
                type="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này"
              />
            </FormGroup>
            <Button color="primary" type="submit" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </Form>
        ) : (
          <Alert color="info">Đăng nhập để viết đánh giá</Alert>
        )}

        {loading ? (
          <div className="text-muted">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="text-muted">Chưa có đánh giá nào.</div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="mb-3 border-0 bg-light">
              <CardBody>
                <div className="d-flex justify-content-between">
                  <strong>{review.userName}</strong>
                  <small className="text-muted">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}</small>
                </div>
                <StarRating rating={review.rating} readonly />
                <p className="mb-0 mt-2">{review.comment}</p>
              </CardBody>
            </Card>
          ))
        )}
      </CardBody>
    </Card>
  );
};

export default ReviewSection;
