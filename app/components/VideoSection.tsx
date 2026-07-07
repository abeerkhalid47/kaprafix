export default function VideoSection() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="video-section__inner">
          <div className="video-wrap">
            <iframe
              src="https://www.youtube.com/embed/2Vv-BfVoq4g?rel=0&modestbranding=1"
              title="How to Use Hem Tape"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="video-text">
            <span className="label">How It Works</span>
            <h2 className="heading mt-4">Perfect Hems in 3 Simple Steps</h2>
            <p className="muted" style={{ marginTop: 12, lineHeight: 1.7 }}>
              Watch how Easy Fit Tape transforms your clothing in minutes — no sewing machine, 
              no experience, and no mess.
            </p>
            <ol style={{ marginTop: 20, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li style={{ fontSize: 14, color: 'var(--text)' }}>
                <strong>1. Place</strong> — Position the tape inside the fabric hem
              </li>
              <li style={{ fontSize: 14, color: 'var(--text)' }}>
                <strong>2. Iron</strong> — Press with a warm iron for 10–15 seconds
              </li>
              <li style={{ fontSize: 14, color: 'var(--text)' }}>
                <strong>3. Done</strong> — Enjoy a perfect, professional-looking hem
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
