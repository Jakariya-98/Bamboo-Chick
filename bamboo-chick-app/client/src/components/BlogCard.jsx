import { slats } from '../utils/swatch.js';
import { date } from '../utils/format.js';
import { mediaUrl } from '../utils/media.js';

export default function BlogCard({ blog, onDelete }) {
  return (
    <div className="card blogcard">
      {blog.coverImage ? <img className="blog-cover" src={mediaUrl(blog.coverImage)} alt={blog.title} loading="lazy" /> : <div className="sw" style={{ background: slats(blog.tone) }} />}
      <div className="pad">
        <div className="spread">
          <span className="muted small">{date(blog.createdAt)}</span>
          {onDelete && <button className="btn ghost sm" onClick={() => onDelete(blog)}>Delete</button>}
        </div>
        <h3 style={{ marginTop: 4 }}>{blog.title}</h3>
        <p className="muted" style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-line' }}>{blog.body}</p>
      </div>
    </div>
  );
}
