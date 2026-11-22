
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import Loading, { ErrorBox } from '../components/Loading.jsx';
import { date } from '../utils/format.js';
import { mediaUrl } from '../utils/media.js';
import { slats } from '../utils/swatch.js';

export default function BlogDetail() {
  const { id } = useParams();

  const { data, error, loading } = useFetch(
    () => api.blogs().then((blogs) => blogs.find((b) => b._id === id) || null),
    [id]
  );

  if (loading) return <Loading />;

  return (
    <div className="page">
      <ErrorBox error={error} />

      {!data ? (
        <>
          <h2>Blog not found</h2>
          <Link to="/blog">Back to blogs</Link>
        </>
      ) : (
        <article className="card pad">
          <Link to="/blog" className="muted">
            ← Back to blogs
          </Link>

          {data.coverImage ? (
            <img
              src={mediaUrl(data.coverImage)}
              alt={data.title}
              style={{
                width: '100%',
                maxHeight: 420,
                objectFit: 'cover',
                borderRadius: 12,
                marginTop: 18
              }}
            />
          ) : (
            <div
              className="sw"
              style={{
                background: slats(data.tone),
                height: 220,
                marginTop: 18,
                borderRadius: 12
              }}
            />
          )}

          <p className="muted small" style={{ marginTop: 18 }}>
            Published {date(data.createdAt)}
          </p>

          <h1>{data.title}</h1>

          <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
            {data.body}
          </p>

          {data.product && (
            <p className="muted">
              Related product: {data.product.name || 'View product'}
            </p>
          )}
        </article>
      )}
    </div>
  );
}
