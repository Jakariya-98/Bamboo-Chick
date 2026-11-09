import { useState } from 'react';
import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { swatchBg } from '../../utils/swatch.js';
import { useToast } from '../../context/ToastContext.jsx';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

const EMPTY = {
  name: '',
  category: 'Roll-Up',
  tone: 'natural',
  basePrice: '',
  discountPrice: '',
  stock: '',
  description: '',
  tags: '',
};

/** "Change price rate" + "Update stock" user stories (+ add a new product) */
export default function SellerProducts() {
  const { data, error, loading, reload } = useFetch(() => api.products(), []);
  const [edits, setEdits] = useState({});
  const [form, setForm] = useState(EMPTY);
  const [imageFiles, setImageFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const toast = useToast();

  const val = (p, k) => edits[p._id]?.[k] ?? p[k];
  const edit = (p, k, v) => setEdits((e) => ({ ...e, [p._id]: { ...e[p._id], [k]: v } }));

  const save = async (p) => {
    try {
      const rawDiscount = val(p, 'discountPrice');
      const discountPrice =
        rawDiscount === '' || rawDiscount === null || rawDiscount === undefined
          ? null
          : Number(rawDiscount);

      await api.updateProduct(p._id, {
        basePrice: Number(val(p, 'basePrice')),
        discountPrice,
        stock: Number(val(p, 'stock')),
      });

      setEdits((current) => {
        const next = { ...current };
        const row = { ...(next[p._id] || {}) };
        delete row.basePrice;
        delete row.discountPrice;
        delete row.stock;
        next[p._id] = Object.keys(row).length ? row : undefined;
        return next;
      });
      toast('Product details saved');
      reload();
    } catch (e) {
      toast(e.message);
    }
  };

  const updateImages = async (p) => {
    const files = edits[p._id]?.imageFiles || [];
    if (!files.length) return toast('Choose one or more images for this product first.');
    setUploadingId(p._id);
    try {
      const uploaded = await Promise.all(files.map(async (file) => (await api.uploadFile(file)).url));
      await api.updateProduct(p._id, { images: [...uploaded, ...(p.images || []).filter(Boolean)] });
      setEdits((current) => {
        const next = { ...current };
        if (next[p._id]) {
          next[p._id] = { ...next[p._id], imageFiles: undefined };
          if (!Object.keys(next[p._id]).some((key) => key !== 'imageFiles' && next[p._id][key] !== undefined)) next[p._id] = undefined;
        }
        return next;
      });
      toast(uploaded.length === 1 ? 'Product cover image updated' : 'Product images updated');
      reload();
    } catch (err) {
      toast(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const images = await Promise.all(imageFiles.map(async (file) => (await api.uploadFile(file)).url));
      await api.createProduct({
        ...form,
        basePrice: Number(form.basePrice),
        discountPrice: form.discountPrice === '' ? null : Number(form.discountPrice),
        stock: Number(form.stock),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images,
      });

      setForm(EMPTY);
      setImageFiles([]);
      e.target.reset();
      toast('New product added to the store');
      reload();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}" from the store? It will be hidden from shoppers, while existing orders remain intact.`)) return;
    try {
      await api.deleteProduct(p._id);
      toast('Product deleted from the store');
      reload();
    } catch (err) {
      toast(err.message);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const hasDetailEdits = (p) => ['basePrice', 'discountPrice', 'stock'].some((key) => edits[p._id]?.[key] !== undefined);

  return (
    <>
      <div className="card pad tablewrap">
        <h3>Change price rate &amp; update stock</h3>
        <ErrorBox error={error} />
        {loading ? <Loading /> : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Base price (৳)</th>
                <th>Discount price (৳)</th>
                <th>Stock</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p._id}>
                  <td><div className="row" style={{ flexWrap: 'nowrap' }}><span className="swatch-sm" style={{ background: swatchBg(p) }} />{p.name}</div></td>
                  <td><input className="mini" type="number" min="0" value={val(p, 'basePrice')} onChange={(e) => edit(p, 'basePrice', e.target.value)} /></td>
                  <td><input className="mini" type="number" min="0" placeholder="—" value={val(p, 'discountPrice') ?? ''} onChange={(e) => edit(p, 'discountPrice', e.target.value)} /></td>
                  <td><input className="mini" type="number" min="0" value={val(p, 'stock')} onChange={(e) => edit(p, 'stock', e.target.value)} /></td>
                  <td>
                    <label className="product-file-picker">
                      <span>{edits[p._id]?.imageFiles?.length ? `${edits[p._id].imageFiles.length} selected` : 'Choose files'}</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => { edit(p, 'imageFiles', Array.from(e.target.files || [])); e.target.value = ''; }} />
                    </label>
                  </td>
                  <td><div className="product-actions"><button className="btn sm" disabled={!hasDetailEdits(p)} onClick={() => save(p)}>Save</button><button className="btn ghost sm" disabled={!edits[p._id]?.imageFiles?.length || uploadingId === p._id} onClick={() => updateImages(p)}>{uploadingId === p._id ? 'Uploading…' : 'Update photo'}</button><button className="btn red sm" onClick={() => remove(p)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="muted small">To change an existing product photo, choose files in that product’s row and click Save on the same row. New photos become the cover image. Size prices come from the base/discount price (4×6 ft = 1.55×, 5×7 ft = 2.2×, custom = 2.6×).</p>
      </div>

      <form className="card pad" style={{ marginTop: 18 }} onSubmit={create}>
        <h3>Add a product</h3>
        <div className="grid g2">
          <div className="field"><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
          <div className="field"><label>Category</label>
            <select value={form.category} onChange={set('category')}>{['Roll-Up', 'Roman', 'Outdoor', 'Matchstick', 'Door'].map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field"><label>Colour tone</label>
            <select value={form.tone} onChange={set('tone')}>{['natural', 'honey', 'walnut', 'charcoal', 'ivory'].map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field"><label>Base price (৳, 3×5 ft)</label><input type="number" min="0" value={form.basePrice} onChange={set('basePrice')} required /></div>
          <div className="field"><label>Discount price (৳, optional)</label><input type="number" min="0" value={form.discountPrice} onChange={set('discountPrice')} /></div>
          <div className="field"><label>Stock</label><input type="number" min="0" value={form.stock} onChange={set('stock')} required /></div>
          <div className="field"><label>Tags (for recommendations)</label><input placeholder="living, privacy, mid" value={form.tags} onChange={set('tags')} /></div>
        </div>
        <div className="field"><label>Description</label><textarea rows={2} value={form.description} onChange={set('description')} /></div>
        <div className="field">
          <label htmlFor="product-images">Product images</label>
          <input id="product-images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
          <small>This creates a separate product listing; it does not change an existing product. Choose one or more JPG, PNG, WEBP, or GIF images. {imageFiles.length ? `${imageFiles.length} file${imageFiles.length === 1 ? '' : 's'} selected.` : 'Images are optional.'}</small>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Add product'}</button>
      </form>
    </>
  );
}
