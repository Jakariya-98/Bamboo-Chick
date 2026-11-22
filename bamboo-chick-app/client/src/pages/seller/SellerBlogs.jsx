
import { useRef, useState } from 'react';
import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { TONES } from '../../utils/swatch.js';
import { useToast } from '../../context/ToastContext.jsx';
import BlogCard from '../../components/BlogCard.jsx';
import { mediaUrl } from '../../utils/media.js';

export default function SellerBlogs() {
  const blogs = useFetch(() => api.blogs(), []);
  const products = useFetch(() => api.products(), []);

  const emptyForm = {
    title: '',
    body: '',
    tone: 'natural',
    product: '',
    coverImage: ''
  };

  const [f, setF] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const fileInput = useRef(null);
  const toast = useToast();

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  const resetForm = () => {
    setF(emptyForm);
    setEditingId(null);
    setCoverFile(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const publish = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      let coverImage = f.coverImage;

      if (coverFile) {
        coverImage = (await api.uploadFile(coverFile)).url;
      }

      const blogData = { ...f, coverImage };

      if (editingId) {
        await api.updateBlog(editingId, blogData);
        toast('Blog updated successfully');
      } else {
        await api.createBlog(blogData);
        toast('Blog published on the store');
      }

      resetForm();
      blogs.reload();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  const edit = (b) => {
    setEditingId(b._id);

    setF({
      title: b.title || '',
      body: b.body || '',
      tone: b.tone || 'natural',
      product: b.product?._id || b.product || '',
      coverImage: b.coverImage || ''
    });

    setCoverFile(null);
    if (fileInput.current) fileInput.current.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete "${b.title}"?`)) return;

    try {
      await api.deleteBlog(b._id);
      toast('Blog deleted');
      blogs.reload();

      if (editingId === b._id) {
        resetForm();
      }
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <form className="card pad" onSubmit={publish}>
        <h3>{editingId ? 'Edit blog post' : 'Write a blog post'}</h3>

        <div className="field">
          <label>Title</label>
          <input
            value={f.title}
            onChange={set('title')}
            placeholder="e.g. Roman vs roll-up: which suits your room?"
            required
          />
        </div>

        <div className="grid g2">
          <div className="field">
            <label>About product (optional)</label>
            <select value={f.product} onChange={set('product')}>
              <option value="">—</option>
              {(products.data || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Cover colour</label>
            <select value={f.tone} onChange={set('tone')}>
              {Object.keys(TONES).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Blog cover image (optional)</label>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          <small className="muted">
            Accepted formats: JPG, PNG, WEBP and GIF.
          </small>

          {coverFile && (
            <p className="small muted">
              Selected image: {coverFile.name}
            </p>
          )}

          {!coverFile && f.coverImage && (
            <div style={{ marginTop: 10 }}>
              <img
                src={mediaUrl(f.coverImage)}
                alt="Current blog cover"
                style={{
                  width: '100%',
                  maxWidth: 250,
                  maxHeight: 150,
                  objectFit: 'cover',
                  borderRadius: 8
                }}
              />
              <p className="small muted">Current cover image</p>
            </div>
          )}
        </div>

        <div className="field">
          <label>Content</label>
          <textarea
            rows={5}
            value={f.body}
            onChange={set('body')}
            required
          />
        </div>

        <button className="btn" disabled={busy}>
          {busy
            ? 'Please wait...'
            : editingId
              ? 'Save Changes'
              : 'Publish'}
        </button>

        {editingId && (
          <button
            type="button"
            className="btn ghost"
            onClick={resetForm}
            style={{ marginLeft: 8 }}
            disabled={busy}
          >
            Cancel
          </button>
        )}
      </form>

      <h3 style={{ marginTop: 22 }}>Published</h3>

      <div className="grid g2">
        {(blogs.data || []).map((b) => (
          <BlogCard
            key={b._id}
            blog={b}
            onEdit={edit}
            onDelete={remove}
          />
        ))}
      </div>
    </>
  );
}
