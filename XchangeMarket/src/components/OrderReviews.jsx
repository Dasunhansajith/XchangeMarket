import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI, reviewAPI } from '../services/api';
import { StarDisplay, StarSelector } from './ProductReviews';
import toast from 'react-hot-toast';
import { MessageSquare, Edit3, Trash2, X, Loader2, Package } from 'lucide-react';

/* ── Create/Edit Review Modal for Order ───────────────────────────────────── */
const OrderReviewModal = ({ 
  orderId, 
  productId, 
  existingReview = null, 
  onClose, 
  onSaved 
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
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
      if (existingReview) {
        // Edit existing review
        await orderAPI.editReview(orderId, { rating, comment });
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        await orderAPI.submitReview(orderId, { rating, comment, productId });
        toast.success('Review submitted successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            {existingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Rating</label>
            <StarSelector value={rating} onChange={setRating} size="md" />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX))}
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition"
              placeholder="Share your experience with this order..."
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">{comment.length}/{MAX}</p>
          </div>
          
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </span>
              ) : existingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Review Card Component ───────────────────────────────────────────────── */
const OrderReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
  const isOwner = currentUserId && (review.buyerId === currentUserId || review.buyerId === String(currentUserId));
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            {(review.buyerName || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{review.buyerName || 'Anonymous'}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <StarDisplay value={review.rating} size="sm" />
          {isOwner && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(review)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit review"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(review.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
};

/* ── Main Order Reviews Component ─────────────────────────────────────────── */
const OrderReviews = ({ orderId, productId, orderStatus, canReview = false }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [orderReview, setOrderReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Determine if user can review based on order status
  const canUserReview = canReview && (
    orderStatus === 'OUT_FOR_DELIVERY' || 
    orderStatus === 'DELIVERED' || 
    orderStatus === 'CLOSED' ||
    orderStatus === 'COMPLETED'
  );

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      // Get product reviews
      const productRes = await reviewAPI.getProductReviews(productId);
      const productReviews = productRes.data || [];
      
      // Try to get order-specific review if available
      try {
        const orderRes = await orderAPI.getMyOrders();
        const myOrders = orderRes.data || [];
        const currentOrder = myOrders.find(order => order.id === orderId);
        
        if (currentOrder?.review) {
          setOrderReview(currentOrder.review);
        }
      } catch (orderErr) {
        // Order review might not exist, that's fine
        console.log('No order review found');
      }
      
      setReviews(productReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [orderId, productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review? This action cannot be undone.')) return;
    
    try {
      // Check if it's an order review or product review
      if (orderReview && orderReview.id === reviewId) {
        await orderAPI.deleteReview(orderId);
        setOrderReview(null);
        toast.success('Order review deleted successfully!');
      } else {
        await reviewAPI.deleteReview(reviewId);
        setReviews(reviews.filter(r => r.id !== reviewId));
        toast.success('Review deleted successfully!');
      }
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to delete review.');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleReviewSaved = () => {
    fetchReviews();
    setShowReviewModal(false);
    setEditingReview(null);
  };

  // Combine order review and product reviews, avoiding duplicates
  const allReviews = orderReview 
    ? [orderReview, ...reviews.filter(r => r.id !== orderReview.id)]
    : reviews;

  return (
    <>
      {showReviewModal && (
        <OrderReviewModal
          orderId={orderId}
          productId={productId}
          existingReview={editingReview}
          onClose={() => {
            setShowReviewModal(false);
            setEditingReview(null);
          }}
          onSaved={handleReviewSaved}
        />
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Reviews & Ratings</h3>
          </div>
          
          {canUserReview && !orderReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-amber-400 text-black rounded-xl text-sm font-bold hover:bg-amber-500 transition-colors"
            >
              Write Review
            </button>
          )}
        </div>

        {/* Review Status Info */}
        {!canUserReview && orderStatus !== 'DELIVERED' && orderStatus !== 'CLOSED' && orderStatus !== 'COMPLETED' && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Review Available During Delivery</p>
                <p className="text-xs text-blue-700 mt-1">
                  You can write and manage reviews once your order is out for delivery or after it's been delivered.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">No reviews yet</p>
              {canUserReview && (
                <p className="text-xs mt-1">Be the first to share your experience!</p>
              )}
            </div>
          ) : (
            allReviews.map((review) => (
              <OrderReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id || user?.userId}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))
          )}
        </div>

        {/* Order Review Action */}
        {orderReview && canUserReview && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 text-center">
              You can edit or delete your review at any time during delivery and after delivery confirmation.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderReviews;
