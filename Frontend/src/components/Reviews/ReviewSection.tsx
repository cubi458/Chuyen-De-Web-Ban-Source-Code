import React from "react";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Progress,
    Row,
} from "reactstrap";
import { db } from "lib/firebase";
import { useAuth } from "context/AuthContext";
import { useOrders } from "context/OrderContext";

type Review = {
    id?: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Timestamp | null;
};

type ReviewSectionProps = {
    productId: string;
};

const StarRating: React.FC<{
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
}> = ({ rating, onRatingChange, readonly = false, size = "md" }) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const fontSize = size === "sm" ? "1rem" : size === "lg" ? "2rem" : "1.5rem";

    return (
        <div className="d-inline-flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    style={{
                        cursor: readonly ? "default" : "pointer",
                        fontSize,
                        color: (hoverRating || rating) >= star ? "#ffc107" : "#e4e5e9",
                        transition: "color 0.2s, transform 0.1s",
                        transform: !readonly && hoverRating === star ? "scale(1.2)" : "scale(1)",
                    }}
                    onClick={() => !readonly && onRatingChange?.(star)}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const { user } = useAuth();
    const { orders } = useOrders();
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [rating, setRating] = React.useState(5);
    const [comment, setComment] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [feedback, setFeedback] = React.useState<{ type: "success" | "danger"; message: string } | null>(null);
    const [helpfulVotes, setHelpfulVotes] = React.useState<Record<string, boolean>>({});

    // Check if current user has purchased this product
    const hasPurchased = React.useMemo(() => {
        if (!user || !orders) return false;
        return orders.some(order =>
            order.status === "paid" &&
            order.items.some(item => item.productId === productId)
        );
    }, [user, orders, productId]);

    React.useEffect(() => {
        const reviewsRef = collection(db, "reviews");
        const q = query(
            reviewsRef,
            where("productId", "==", productId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const reviewList: Review[] = [];
                snapshot.forEach((doc) => {
                    reviewList.push({ id: doc.id, ...doc.data() } as Review);
                });
                setReviews(reviewList);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching reviews:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [productId]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setFeedback({ type: "danger", message: "Bạn cần đăng nhập để đánh giá" });
            return;
        }

        if (!comment.trim()) {
            setFeedback({ type: "danger", message: "Vui lòng nhập nội dung đánh giá" });
            return;
        }

        setSubmitting(true);
        try {
            const newReview: Omit<Review, "id"> = {
                productId,
                userId: user.uid,
                userName: user.displayName || user.email || "Ẩn danh",
                rating,
                comment: comment.trim(),
                createdAt: serverTimestamp() as Timestamp,
            };

            await addDoc(collection(db, "reviews"), newReview);
            setComment("");
            setRating(5);
            setFeedback({ type: "success", message: "Đánh giá của bạn đã được gửi!" });
        } catch (error) {
            console.error("Error submitting review:", error);
            setFeedback({ type: "danger", message: "Không thể gửi đánh giá. Vui lòng thử lại." });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (timestamp: Timestamp | null) => {
        if (!timestamp) return "";
        return timestamp.toDate().toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const toggleHelpful = (reviewId: string) => {
        setHelpfulVotes(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
        : 0;

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
            : 0
    }));

    const getAvatarColor = (name: string) => {
        const colors = [
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
            "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <Card className="mt-4 shadow-sm border-0">
            <CardHeader className="bg-white border-0">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <h4 className="mb-0">
                        <i className="now-ui-icons ui-2_chat-round mr-2 text-primary"></i>
                        Đánh giá & Bình luận
                    </h4>
                    <div className="d-flex align-items-center">
                        <div className="text-center mr-3">
                            <div className="h2 mb-0 font-weight-bold text-warning">{averageRating.toFixed(1)}</div>
                            <StarRating rating={Math.round(averageRating)} readonly size="sm" />
                        </div>
                        <Badge color="light" className="text-muted px-3 py-2">
                            {reviews.length} đánh giá
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                {/* Rating Distribution */}
                {reviews.length > 0 && (
                    <div className="mb-4 p-3 bg-light rounded">
                        <h6 className="mb-3">Phân bố đánh giá</h6>
                        {ratingDistribution.map(({ star, count, percentage }) => (
                            <Row key={star} className="align-items-center mb-1">
                                <Col xs="2" className="pr-0">
                                    <small className="text-muted">{star} sao</small>
                                </Col>
                                <Col>
                                    <Progress
                                        value={percentage}
                                        color={star >= 4 ? "success" : star >= 3 ? "warning" : "danger"}
                                        style={{ height: 8 }}
                                    />
                                </Col>
                                <Col xs="2" className="pl-0 text-right">
                                    <small className="text-muted">{count}</small>
                                </Col>
                            </Row>
                        ))}
                    </div>
                )}

                {/* Review Form */}
                {user ? (
                    <Form onSubmit={handleSubmitReview} className="mb-4 p-4 bg-light rounded">
                        <div className="d-flex align-items-center mb-3">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                style={{
                                    width: 45,
                                    height: 45,
                                    background: getAvatarColor(user.displayName || user.email || "U"),
                                }}
                            >
                                <span className="text-white font-weight-bold">
                                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h6 className="mb-0">{user.displayName || "Bạn"}</h6>
                                {hasPurchased && (
                                    <Badge color="success" className="mt-1">
                                        <i className="now-ui-icons ui-1_check mr-1"></i>
                                        Đã mua sản phẩm
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {feedback && (
                            <Alert color={feedback.type} toggle={() => setFeedback(null)} className="mb-3">
                                {feedback.message}
                            </Alert>
                        )}

                        <FormGroup>
                            <Label className="font-weight-bold">Đánh giá sao</Label>
                            <div className="d-flex align-items-center">
                                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                                <span className="ml-3 text-muted">
                                    {rating === 5 ? "Xuất sắc!" :
                                        rating === 4 ? "Tốt" :
                                            rating === 3 ? "Bình thường" :
                                                rating === 2 ? "Không tốt" : "Rất tệ"}
                                </span>
                            </div>
                        </FormGroup>

                        <FormGroup>
                            <Label className="font-weight-bold">Nội dung đánh giá</Label>
                            <Input
                                type="textarea"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... Mô tả những điểm bạn thích và không thích."
                                style={{ resize: "none" }}
                            />
                        </FormGroup>

                        <Button color="primary" type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm mr-2"></span>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <i className="now-ui-icons ui-1_send mr-2"></i>
                                    Gửi đánh giá
                                </>
                            )}
                        </Button>
                    </Form>
                ) : (
                    <Alert color="info" className="mb-4">
                        <i className="now-ui-icons users_single-02 mr-2"></i>
                        <a href="/#/store/auth" className="alert-link">Đăng nhập</a> để viết đánh giá
                    </Alert>
                )}

                {/* Reviews List */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Đang tải...</span>
                        </div>
                        <p className="mt-3 text-muted">Đang tải đánh giá...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-5">
                        <div
                            className="mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                                width: 80,
                                height: 80,
                                background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)"
                            }}
                        >
                            <i className="now-ui-icons ui-2_chat-round" style={{ fontSize: "2rem", color: "#adb5bd" }}></i>
                        </div>
                        <h5 className="text-dark mb-2">Chưa có đánh giá nào</h5>
                        <p className="text-muted mb-0">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    </div>
                ) : (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="review-item border-bottom py-4"
                                style={{ transition: "background-color 0.2s" }}
                            >
                                <div className="d-flex">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                            width: 50,
                                            height: 50,
                                            background: getAvatarColor(review.userName),
                                        }}
                                    >
                                        <span className="text-white font-weight-bold" style={{ fontSize: "1.2rem" }}>
                                            {review.userName[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-3 flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <strong className="text-dark d-block">{review.userName}</strong>
                                                <StarRating rating={review.rating} readonly size="sm" />
                                            </div>
                                            <small className="text-muted">{formatDate(review.createdAt)}</small>
                                        </div>
                                        <p className="mb-3 text-secondary" style={{ lineHeight: 1.7 }}>
                                            {review.comment}
                                        </p>
                                        <div className="d-flex align-items-center">
                                            <Button
                                                color={helpfulVotes[review.id || ""] ? "success" : "light"}
                                                size="sm"
                                                className="mr-2"
                                                onClick={() => toggleHelpful(review.id || "")}
                                            >
                                                <i className={`now-ui-icons ${helpfulVotes[review.id || ""] ? "ui-1_check" : "gestures_tap-01"} mr-1`}></i>
                                                Hữu ích {helpfulVotes[review.id || ""] && "(+1)"}
                                            </Button>
                                            <small className="text-muted">
                                                {Math.floor(Math.random() * 10) + 1} người thấy hữu ích
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default ReviewSection;
