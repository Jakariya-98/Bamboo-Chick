import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import BlogCard from '../components/BlogCard.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

export default function Blog() {
  const { data, error, loading } = useFetch(() => api.blogs(), []);
  return (
    <>
      <h1>Blog</h1>
      <p className="muted">Tips and product stories from the Bamboo Chick team.</p>
      <ErrorBox error={error} />
      {loading ? <Loading /> : <div className="grid g3">{(data || []).map((b) => <BlogCard key={b._id} blog={b} />)}</div>}
    </>
  );
}
