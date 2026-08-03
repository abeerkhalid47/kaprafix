'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

interface ReviewFormProps {
  onClose: () => void;
  onSuccess: (review: ReviewData) => void;
}

export interface ReviewData {
  _id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  imageUrls: string[];
  label: string;
  initials: string;
  createdAt: string;
}

interface PreviewImage {
  url: string;
  file: File;
}

export default function ReviewForm({ onClose, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    const newPreviews = files.map((f) => ({ url: URL.createObjectURL(f), file: f }));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 3));
  }, []);

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return updated;
    });
  };

  const validate = (data: FormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    const name = (data.get('name') as string)?.trim();
    const text = (data.get('text') as string)?.trim();
    if (!name || name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!text || text.length < 10) errs.text = 'Review must be at least 10 characters';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const data = new FormData(formRef.current);
    data.set('rating', String(rating));

    // Attach image files
    previews.forEach(({ file }) => data.append('images', file));

    const fieldErrors = validate(data);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    const toastId = toast.loading('Submitting your review…');

    try {
      const res = await fetch('/api/reviews', { method: 'POST', body: data });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Something went wrong');

      toast.success('Your review has been posted! 🎉', { id: toastId });
      onSuccess(json.review);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="review-modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Write a Review">
        <div className="review-modal-panel">
          {/* Header */}
          <div className="review-modal-header">
            <div>
              <h2 className="review-modal-title">Write a Review</h2>
              <p className="review-modal-subtitle">Share your experience with KapraFix</p>
            </div>
            <button className="review-modal-close" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="review-form" noValidate>
            {/* Star Rating */}
            <div className="review-field">
              <label className="review-label">Your Rating *</label>
              <div className="star-picker" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= (hoverRating || rating) ? 'star-btn--active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input type="hidden" name="rating" value={rating} />
            </div>

            {/* Name + Location */}
            <div className="review-field-row">
              <div className="review-field">
                <label htmlFor="rf-name" className="review-label">Your Name *</label>
                <input
                  id="rf-name"
                  name="name"
                  type="text"
                  className={`review-input ${errors.name ? 'review-input--error' : ''}`}
                  placeholder="e.g. Ali Khan"
                  autoComplete="name"
                />
                {errors.name && <span className="review-field-error">{errors.name}</span>}
              </div>
              <div className="review-field">
                <label htmlFor="rf-location" className="review-label">City (Optional)</label>
                <input
                  id="rf-location"
                  name="location"
                  type="text"
                  className="review-input"
                  placeholder="e.g. Lahore"
                />
              </div>
            </div>

            {/* Review Text */}
            <div className="review-field">
              <label htmlFor="rf-text" className="review-label">Your Review *</label>
              <textarea
                id="rf-text"
                name="text"
                className={`review-textarea ${errors.text ? 'review-input--error' : ''}`}
                placeholder="Tell others about your experience with KapraFix…"
                rows={4}
              />
              {errors.text && <span className="review-field-error">{errors.text}</span>}
            </div>

            {/* Caption / Label */}
            <div className="review-field">
              <label htmlFor="rf-label" className="review-label">Photo Caption (Optional)</label>
              <input
                id="rf-label"
                name="label"
                type="text"
                className="review-input"
                placeholder="e.g. Perfect Trouser Hem"
              />
            </div>

            {/* Image Upload */}
            <div className="review-field">
              <label className="review-label">Add Photos (up to 3)</label>
              <div
                className="file-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                tabIndex={0}
                role="button"
                aria-label="Upload photos"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="file-upload-text">Click to upload photos</span>
                <span className="file-upload-hint">JPG, PNG, WEBP · Max 5MB each · Up to 3 photos</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="file-upload-input"
                  onChange={handleFileChange}
                  aria-hidden="true"
                />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="file-preview-grid">
                  {previews.map((p, i) => (
                    <div key={i} className="file-preview-item">
                      <Image
                        src={p.url}
                        alt={`Preview ${i + 1}`}
                        fill
                        sizes="100px"
                        style={{ objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="file-preview-remove"
                        onClick={() => removePreview(i)}
                        aria-label={`Remove image ${i + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="review-submit-btn"
              disabled={submitting}
              id="review-submit-btn"
            >
              {submitting ? (
                <span className="review-submit-spinner" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
                  </svg>
                  Submit Review
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
