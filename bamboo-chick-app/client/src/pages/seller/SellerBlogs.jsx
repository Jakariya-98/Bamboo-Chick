import { useState } from 'react';
import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { TONES } from '../../utils/swatch.js';
import { useToast } from '../../context/ToastContext.jsx';
import BlogCard from '../../components/BlogCard.jsx';

/** "Add blogs over my products" user story */
export default function SellerBlogs() {
  const blogs = useFetch(() => api.blogs(), []);
  const products = useFetch(() => api.products(), []);
  const [f, setF] = useState({ title: '', body: '', tone: 'natural', product: '' });
  const toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const publish = async (e) => {
    e.preventDefault();
    try {
      await api.createBlog(f);
      setF({ title: '', body: '', tone: 'natural', product: '' });
      toast('Blog published on the store');
      blogs.reload();
    } catch (err) { toast(err.message); }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    try { await api.deleteBlog(b._id); blogs.reload(); } catch (err) { toast(err.message); }
  };

  return (
    <>
      <form className="card pad" onSubmit={publish}>
        <h3>Write a blog post</h3>
        <div className="field"><label>Title</label><input value={f.title} onChange={set('title')} placeholder="e.g. Roman vs roll-up: which suits your room?" required /></div>
        <div className="grid g2">
          <div className="field"><label>About product (optional)</label>
            <select value={f.product} onChange={set('product')}>
              <option value="">—</option>
              {(products.data || []).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Cover colour</label>
            <select value={f.tone} onChange={set('tone')}>{Object.keys(TONES).map((t) => <option key={t}>{t}</option>)}</select>
          </div>
        </div>
        <div className="field"><label>Content</label><textarea rows={5} value={f.body} onChange={set('body')} required /></div>
        <button className="btn">Publish</button>
      </form>
      <h3 style={{ marginTop: 22 }}>Published</h3>
      <div className="grid g2">{(blogs.data || []).map((b) => <BlogCard key={b._id} blog={b} onDelete={remove} />)}</div>
    </>
  );
}
