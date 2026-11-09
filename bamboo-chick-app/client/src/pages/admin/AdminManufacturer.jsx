import { useState } from 'react';
import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import BlogCard from '../../components/BlogCard.jsx';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

export default function AdminManufacturer() {
  const page = useFetch(() => api.manufacturer(), []);
  const blogs = useFetch(() => api.blogs(), []);
  const [details, setDetails] = useState(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [blog, setBlog] = useState({ title: '', body: '', coverImage: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const current = details || page.data || { title: 'About Bamboo Chick', description: '' };
  const setBlogField = (key) => (e) => setBlog({ ...blog, [key]: e.target.value });

  const saveDetails = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.updateManufacturer({ title: current.title, description: current.description }); await page.reload(); setDetails(null); toast('Manufacturer details saved'); }
    catch (err) { toast(err.message); }
    finally { setBusy(false); }
  };

  const addMedia = async (e) => {
    e.preventDefault();
    if (!mediaFile) return toast('Choose a picture or video first.');
    setBusy(true);
    try { await api.addManufacturerMedia(mediaFile, mediaTitle); setMediaFile(null); setMediaTitle(''); e.target.reset(); await page.reload(); toast('Media added to manufacturer page'); }
    catch (err) { toast(err.message); }
    finally { setBusy(false); }
  };

  const removeMedia = async (item) => {
    if (!window.confirm(`Remove "${item.title || 'this media'}" from the manufacturer page?`)) return;
    try { await api.deleteManufacturerMedia(item._id); await page.reload(); toast('Media removed'); }
    catch (err) { toast(err.message); }
  };

  const publishBlog = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      let coverImage = '';
      if (coverFile) coverImage = (await api.uploadFile(coverFile)).url;
      await api.createBlog({ title: blog.title, body: blog.body, coverImage, tone: 'natural' });
      setBlog({ title: '', body: '', coverImage: '' }); setCoverFile(null); e.target.reset(); await blogs.reload(); toast('Blog published');
    } catch (err) { toast(err.message); }
    finally { setBusy(false); }
  };

  const removeBlog = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try { await api.deleteBlog(item._id); await blogs.reload(); toast('Blog deleted'); }
    catch (err) { toast(err.message); }
  };

  if (page.loading) return <Loading />;

  return <div className="manufacturer-admin">
    <ErrorBox error={page.error} />
    <form className="card pad" onSubmit={saveDetails}>
      <h2>Manufacturer details</h2>
      <p className="muted">This information appears on the public Manufacturer page.</p>
      <div className="field"><label>Page title</label><input value={current.title || ''} onChange={(e) => setDetails({ ...current, title: e.target.value })} required /></div>
      <div className="field"><label>Manufacturer description</label><textarea rows={5} value={current.description || ''} onChange={(e) => setDetails({ ...current, description: e.target.value })} required /></div>
      <button className="btn" disabled={busy}>Save details</button>
    </form>

    <form className="card pad" onSubmit={addMedia} style={{ marginTop: 18 }}>
      <h2>Upload pictures and videos</h2>
      <p className="muted">Accepted images: JPG, PNG, WEBP, GIF. Videos: MP4, WEBM, MOV. Maximum file size: 100 MB.</p>
      <div className="field"><label>Media title (optional)</label><input value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} placeholder="e.g. Inside our Dhaka workshop" /></div>
      <div className="field"><label>Choose picture or video</label><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} required /></div>
      <button className="btn" disabled={busy}>{busy ? 'Please wait…' : 'Upload to manufacturer page'}</button>
    </form>

    <section className="card pad" style={{ marginTop: 18 }}>
      <h2>Published manufacturer media</h2>
      {(page.data?.media || []).length ? <div className="grid g2">{page.data.media.map((item) => <div className="media-admin-card" key={item._id}>
        {item.type === 'video' ? <video src={item.url} controls /> : <img src={item.url} alt={item.title || 'Bamboo Chick manufacturer'} />}
        <div className="spread"><span>{item.title || (item.type === 'video' ? 'Video' : 'Picture')}</span><button type="button" className="btn red sm" onClick={() => removeMedia(item)}>Delete</button></div>
      </div>)}</div> : <p className="muted">No pictures or videos have been uploaded yet.</p>}
    </section>

    <form className="card pad" onSubmit={publishBlog} style={{ marginTop: 18 }}>
      <h2>Write a manufacturer blog</h2>
      <p className="muted">Share details about the workshop, materials, production steps, or the people behind Bamboo Chick.</p>
      <div className="field"><label>Blog title</label><input value={blog.title} onChange={setBlogField('title')} required placeholder="e.g. How we make bamboo curtains" /></div>
      <div className="field"><label>Blog details</label><textarea rows={6} value={blog.body} onChange={setBlogField('body')} required placeholder="Write the full story here…" /></div>
      <div className="field"><label>Cover picture (optional)</label><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></div>
      <button className="btn" disabled={busy}>{busy ? 'Please wait…' : 'Publish blog'}</button>
    </form>

    <section style={{ marginTop: 22 }}><h2>Published blogs</h2><ErrorBox error={blogs.error} />
      {blogs.loading ? <Loading /> : <div className="grid g2">{(blogs.data || []).map((item) => <BlogCard key={item._id} blog={item} onDelete={removeBlog} />)}</div>}
    </section>
  </div>;
}
