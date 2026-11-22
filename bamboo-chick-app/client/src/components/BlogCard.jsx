
import { Link } from 'react-router-dom';
import { slats } from '../utils/swatch.js';
import { date } from '../utils/format.js';
import { mediaUrl } from '../utils/media.js';

export default function BlogCard({ blog, onEdit, onDelete }) {
  return (
    <div className="card blogcard">
      {blog.coverImage ? (
        <img
          className="blog-cover"
          src={mediaUrl(blog.coverImage)}
          alt={blog.title}
          loading="lazy"
        />
      ) : (
        <div className="sw" style={{ background: slats(blog.tone) }} />
      )}

      <div className="pad">
        <div className="spread">
          <span className="muted small">{date(blog.createdAt)}</span>

          {onEdit && (
            <div>
              <button
                className="btn ghost sm"
                type="button"
                onClick={() => onEdit(blog)}
              >
                Edit
              </button>

              <button
                className="btn ghost sm"
                type="button"
                onClick={() => onDelete(blog)}
                style={{ marginLeft: 6 }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <h3 style={{ marginTop: 4 }}>{blog.title}</h3>

        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: 14,
            whiteSpace: 'pre-line'
          }}
        >
          {blog.body.length > 160
            ? `${blog.body.slice(0, 160)}...`
            : blog.body}
        </p>

        <Link
          to={`/blog/${blog._id}`}
          className="btn ghost sm"
          style={{ display: 'inline-block', marginTop: 12 }}
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
