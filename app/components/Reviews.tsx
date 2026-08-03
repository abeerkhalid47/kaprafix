'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import dynamic from 'next/dynamic';
import type { ReviewData } from './ReviewForm';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const ReviewForm = dynamic(() => import('./ReviewForm'), { ssr: false });

// ── Helpers ───────────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="review-card__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'star star--filled' : 'star star--empty'}>★</span>
      ))}
    </div>
  );
}

function AvatarInitials({ initials }: { initials: string }) {
  return <div className="review-card__avatar">{initials}</div>;
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, index }: { review: ReviewData; index: number }) {
  const hasImage = review.imageUrls && review.imageUrls.length > 0;
  const imgSrc = hasImage ? review.imageUrls[0] : null;

  return (
    <article
      className={`review-card ${hasImage ? 'review-card--with-img' : ''} review-card-anim`}
      style={{ '--card-index': index } as React.CSSProperties}
    >
      {imgSrc && (
        <div className="review-card__img-wrap">
          <Image
            src={imgSrc}
            alt={review.label || `Review by ${review.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
          {review.label && (
            <span className="review-card__img-label">{review.label}</span>
          )}
        </div>
      )}
      <div className="review-card__body">
        <StarRating rating={review.rating} />
        <p className="review-card__text">"{review.text}"</p>
        <div className="review-card__author">
          <AvatarInitials initials={review.initials || review.name.slice(0, 2).toUpperCase()} />
          <div className="review-card__author-info">
            <span className="review-card__name">{review.name}</span>
            {review.location && (
              <span className="review-card__location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {review.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const fetchReviews = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?page=${pageNum}&limit=5`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages || Math.ceil(data.total / 5) || 1);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    fetchReviews(newPage);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReviewSuccess = (newReview: ReviewData) => {
    // Reload page 1 to show newest review at top
    fetchReviews(1);
  };

  // GSAP stagger animation for cards
  useGSAP(() => {
    if (!sectionRef.current) return;

    // Animate header
    if (headerRef.current) {
      gsap.from(headerRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    }
  }, { scope: sectionRef });

  // Animate newly loaded cards on page change
  useEffect(() => {
    const cards = document.querySelectorAll('.review-card-anim');
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
      }
    );
  }, [reviews]);

  // Average rating
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 5;

  return (
    <section className="reviews-section" ref={sectionRef} id="reviews">
      <div className="reviews-inner">
        {/* Section Header */}
        <div className="reviews-header" ref={headerRef}>
          <span className="reviews-eyebrow">Customer Reviews</span>
          <h2 className="reviews-heading">What our customers say</h2>

          {/* Rating Summary */}
          <div className="reviews-summary">
            <div className="reviews-summary__score">
              <span className="reviews-summary__avg">{avgRating}</span>
              <div className="reviews-summary__stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`summary-star ${i < Math.round(avgRating) ? 'summary-star--filled' : ''}`}>★</span>
                ))}
              </div>
              <span className="reviews-summary__count">
                {total} review{total !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              id="write-review-btn"
              className="reviews-write-btn"
              onClick={() => setShowForm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Write a Review
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="reviews-skeleton-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="review-skeleton" />
            ))}
          </div>
        ) : (
          <div className="reviews-masonry-grid" ref={gridRef}>
            {reviews.map((r, i) => (
              <ReviewCard key={r._id} review={r} index={i} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="reviews-pagination">
            <button
              id="prev-reviews-btn"
              className="pagination-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              aria-label="Previous Page"
            >
              ‹ Prev
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-number ${p === page ? 'pagination-number--active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              id="next-reviews-btn"
              className="pagination-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              aria-label="Next Page"
            >
              Next ›
            </button>
          </div>
        )}

        {/* CTA at the bottom */}
        {!loading && (
          <div className="reviews-cta">
            <p className="reviews-cta__text">Had a great experience?</p>
            <button
              id="write-review-cta-btn"
              className="reviews-write-btn reviews-write-btn--large"
              onClick={() => setShowForm(true)}
            >
              Share Your Story
            </button>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          onClose={() => setShowForm(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </section>
  );
}
