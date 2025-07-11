import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import '../styles/review.css';
import { BASE_URL } from "../config";

const ReviewSection = ({ productId }) => {
  const { userInfo } = useContext(UserContext);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userReviewed, setUserReviewed] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [ratingBreakdown, setRatingBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/reviews/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        
        if (data.reviews) {
          setReviews(data.reviews);
          setAverageRating(data.averageRating || 0);
          calculateRatingBreakdown(data.reviews);
          if (userInfo?.email) {
            setUserReviewed(data.reviews.some(review => review.email === userInfo.email));
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, userInfo?.email]);

  const calculateRatingBreakdown = (reviewsData) => {
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(review => breakdown[review.rating]++);
    setRatingBreakdown(breakdown);
  };

  const handleSubmitReview = async () => {
    if (!userInfo?.email) {
      setError('Please log in to submit a review.');
      return;
    }
    
    if (!rating) {
      setError('Please select a rating.');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please provide a review comment.');
      return;
    }
    
    if (userReviewed) {
      setError('You have already reviewed this product.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          rating,
          comment: comment.trim(),
          verifiedBuyer: true // Assuming verified status from context if needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const newReview = await response.json();
      // Refetch reviews to get all updated data including reactions
      const res = await fetch(`${BASE_URL}/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      calculateRatingBreakdown(data.reviews);
      setComment('');
      setRating(0);
      setUserReviewed(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (reviewId, reactionType) => {
    if (!userInfo?.email) {
      setError('Please log in to react to reviews.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/reviews/${reviewId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userInfo.email, 
          action: reactionType 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process reaction');
      }

      const result = await response.json();
      
      // Update the specific review's reactions
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId 
            ? { 
                ...review, 
                likes: result.likes,
                dislikes: result.dislikes,
                reactions: {
                  ...review.reactions,
                  [userInfo.email]: result.userAction || null
                }
              } 
            : review
        )
      );
    } catch (err) {
      console.error('Error processing reaction:', err);
      setError(err.message || 'Failed to process reaction.');
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'rating') return b.rating - a.rating;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <section className="review-section" aria-labelledby="review-section-heading">
      <h3 id="review-section-heading">Customer Reviews</h3>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="average-rating">
          <span className="average-score">{averageRating.toFixed(1)}</span>
          <span className="out-of">out of 5</span>
          <div className="stars">
            {'★'.repeat(Math.round(averageRating))}
            {'☆'.repeat(5 - Math.round(averageRating))}
          </div>
          <span className="total-reviews">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="rating-bar">
              <span className="star-label">{star} star</span>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{
                    width: `${reviews.length > 0 ? (ratingBreakdown[star] / reviews.length) * 100 : 0}%`
                  }}
                  aria-valuenow={ratingBreakdown[star]}
                  aria-valuemin="0"
                  aria-valuemax={reviews.length}
                ></div>
              </div>
              <span className="count">{ratingBreakdown[star]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Controls */}
      <div className="review-controls">
        <div className="sort-options">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            disabled={reviews.length === 0}
          >
            <option value="newest">Most Recent</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {isLoading && reviews.length === 0 ? (
          <div className="loading-spinner">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        ) : (
          sortedReviews.map((review) => {
            const userReaction = review.reactions?.[userInfo?.email];
            const isOwnReview = review.email === userInfo?.email;
            
            return (
              <article key={review._id} className="review-card">
                <header className="review-header">
                  <div className="review-meta">
                    <span className="review-author">{review.email}</span>
                    {review.verifiedBuyer && (
                      <span className="verified-badge" title="Verified purchaser">
                        ✓ Verified Buyer
                      </span>
                    )}
                    <time 
                      className="review-date" 
                      dateTime={review.timestamp}
                    >
                      {new Date(review.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  <div 
                    className="review-rating"
                    aria-label={`Rated ${review.rating} out of 5 stars`}
                  >
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                </header>
                
                <div className="review-content">
                  <p>{review.comment}</p>
                </div>
                
                {!isOwnReview && (
                  <footer className="review-footer">
                    <div className="review-helpful">
                      <span>Was this review helpful?</span>
                      <button
                        className={`reaction-btn ${userReaction === 'like' ? 'active' : ''}`}
                        onClick={() => handleReaction(review._id, 'like')}
                        aria-label="Like this review"
                        disabled={!userInfo}
                      >
                        <span aria-hidden="true">👍</span> {review.likes || 0}
                      </button>
                      <button
                        className={`reaction-btn ${userReaction === 'dislike' ? 'active' : ''}`}
                        onClick={() => handleReaction(review._id, 'dislike')}
                        aria-label="Dislike this review"
                        disabled={!userInfo}
                      >
                        <span aria-hidden="true">👎</span> {review.dislikes || 0}
                      </button>
                    </div>
                  </footer>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Review Form */}
      {!userReviewed && userInfo && (
        <div className="review-form-container">
          <h4>Write a Review</h4>
          <div className="form-group">
            <label htmlFor="rating-input">Your Rating:</label>
            <div 
              className="star-rating"
              role="radiogroup"
              aria-labelledby="rating-label"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${hoverRating >= star || rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  aria-checked={rating === star}
                  role="radio"
                >
                  {hoverRating >= star || rating >= star ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="review-comment">Your Review:</label>
            <textarea
              id="review-comment"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="5"
              maxLength="500"
            />
            <div className="character-count">{comment.length}/500</div>
          </div>
          
          <button
            className="submit-review-btn"
            onClick={handleSubmitReview}
            disabled={isLoading || !rating || !comment.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      )}

      {!userInfo && (
        <div className="login-prompt">
          <p>Please log in to leave a review.</p>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;