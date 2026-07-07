const REVIEWS = [
  { name: 'Ali', location: 'Lahore', text: 'Quality expectation se bhi achi hai! Bilkul waisi kaam ki jaise unhon ne claim kiya tha. Repeat order karunga zaroor.', initials: 'A' },
  { name: 'Usman', location: 'Karachi', text: 'Bahut acha product hai. Meri pants ka hem bilkul perfect ho gaya. Kisi ko bhi nahi pata ke tape use ki hai. Sab ko recommend karunga.', initials: 'U' },
  { name: 'Ayesha', location: 'Islamabad', text: 'Fast delivery aur packaging bhi solid thi. Product ne bilkul kaam kiya. Meri bachi ke school uniform ka hem perfect ho gaya 5 minutes mein.', initials: 'Ay' },
  { name: 'Bilal', location: 'Faisalabad', text: '100% genuine product. Tailoring pe Rs. 500 bachaye. Dobara zaroor order karunga. COD bhi available hai jo bahut convenient hai.', initials: 'B' },
  { name: 'Sana', location: 'Multan', text: 'Pehle trust nahi tha online products pe, but is ne sach mein kaam kiya! Mere curtains ka hem bhi isi se kiya. Zabardast!', initials: 'S' },
];

export default function Reviews() {
  return (
    <section className="section section-alt" id="reviews">
      <div className="container">
        <div className="section-header">
          <span className="label">Customer Reviews</span>
          <h2 className="heading mt-4">Loved by Thousands Across Pakistan</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <span className="stars" style={{ fontSize: 20 }}>★★★★★</span>
            <span style={{ fontWeight: 600 }}>4.9</span>
            <span className="muted" style={{ fontSize: 14 }}>out of 5 (48 reviews)</span>
          </div>
        </div>
        <div className="reviews__grid">
          {REVIEWS.map((r) => (
            <div key={r.name} className="review-card">
              <div className="stars stars-sm">★★★★★</div>
              <p className="review-card__text">"{r.text}"</p>
              <div className="review-card__author">
                <div className="review-card__avatar">{r.initials}</div>
                <div>
                  <div className="review-card__name">{r.name}</div>
                  <div className="review-card__location">{r.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
