import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../services/api';

/* ── Reusable Star Display (read-only) ───────────────────────────────────── */
export const StarDisplay = ({ value, size = 'sm' }) => {
    const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    viewBox="0 0 20 20"
                    className={`${sizes[size]} ${star <= value ? 'text-amber-400' : 'text-gray-200'}`}
                    fill="currentColor"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

/* ── Reusable Interactive Star Selector ──────────────────────────────────── */
export const StarSelector = ({ value, onChange, size = 'md' }) => {
    const [hovered, setHovered] = useState(0);
    const sizes = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-9 h-9' };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = hovered ? star <= hovered : star <= value;
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange && onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className={`${sizes[size]} transition-transform duration-100 hover:scale-125 cursor-pointer focus:outline-none`}
                    >
                        <svg
                            viewBox="0 0 20 20"
                            className={`w-full h-full transition-colors duration-100 ${filled ? 'text-amber-400' : 'text-gray-300'}`}
                            fill="currentColor"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

/* ── Edit Review Modal ───────────────────────────────────────────────────── */
const EditReviewModal = ({ review, onClose, onSaved }) => {
    const [rating, setRating] = useState(review.rating || 0);
    const [comment, setComment] = useState(review.comment || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const MAX = 1000;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (rating === 0) { setError('Please select a rating.'); return; }
        if (!comment.trim()) { setError('Please write a comment.'); return; }
        setSubmitting(true);
        try {
            await reviewAPI.updateReview(review.id, { rating, comment });
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update review.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Edit Your Review</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Rating</label>
                        <StarSelector value={rating} onChange={setRating} size="md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value.slice(0, MAX))}
                            rows={4}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition"
                            placeholder="Share your experience..."
                        />
                        <p className="text-right text-xs text-gray-400 mt-0.5">{comment.length}/{MAX}</p>
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
                            {submitting ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Single Review Card ──────────────────────────────────────────────────── */
const ReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
    const isOwner = currentUserId && (review.buyerId === currentUserId || review.buyerId === String(currentUserId));
    const date = review.createdAt
        ? new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

    return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(review.buyerName || 'A')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{review.buyerName || 'Anonymous'}</p>
                        {date && <p className="text-xs text-gray-400">{date}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <StarDisplay value={review.rating} size="sm" />
                    {isOwner && (
                        <div className="flex gap-1 ml-1">
                            <button
                                onClick={() => onEdit(review)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit review"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onDelete(review.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete review"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed pl-10">{review.comment}</p>
            )}
        </div>
    );
};

/* ── Main ProductReviews Component (display-only in product card) ─────────── */
const ProductReviews = ({ productId, averageRating = 0, reviewCount = 0, onRatingsChange }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);

    const fetchReviews = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await reviewAPI.getProductReviews(productId);
            setReviews(res.data || []);
        } catch {
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await reviewAPI.deleteReview(reviewId);
            fetchReviews();
            if (onRatingsChange) onRatingsChange();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete review.');
        }
    };

    const handleSaved = () => {
        fetchReviews();
        if (onRatingsChange) onRatingsChange();
    };

    /* Derived display values */
    const liveAvg = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
        : averageRating;
    const liveCount = reviews.length || reviewCount;
    const displayRating = liveAvg > 0 ? liveAvg.toFixed(1) : null;

    return (
        <>
            {editingReview && (
                <EditReviewModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onSaved={handleSaved}
                />
            )}

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Product Reviews</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-bold text-amber-700">
                                {displayRating || 'No Ratings'}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{liveCount} Review{liveCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Review List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <p className="text-sm font-medium">No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                currentUserId={user?.id || user?.userId}
                                onEdit={setEditingReview}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductReviews;
