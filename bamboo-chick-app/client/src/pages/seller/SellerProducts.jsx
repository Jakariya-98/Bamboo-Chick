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
  stock: '',
  description: '',
  tags: '',
  images: '',
};

/** "Change price rate" + "Update stock" user stories (+ add a new product) */
export default function SellerProducts() {
  const { data, error, loading, reload } = useFetch(() => api.products(), []);
  const [edits, setEdits] = useState({});
  const [form, setForm] = useState(EMPTY);
  const toast = useToast();

  const val = (p, k) => edits[p._id]?.[k] ?? p[k];
  const edit = (p, k, v) => setEdits((e) => ({ ...e, [p._id]: { ...e[p._id], [k]: v } }));


const save = async (p) => {
  try {
    await api.updateProduct(p._id, {
      basePrice: Number(val(p, 'basePrice')),
      stock: Number(val(p, 'stock')),
      images: (val(p, 'images') ?? (p.images || []).join(', '))
        .split(',')
        .map((image) => image.trim())
        .filter(Boolean),
    });

    setEdits((e) => ({ ...e, [p._id]: undefined }));
    toast('Product updated successfully');
    reload();
  } catch (e) {
    toast(e.message);
  }};
const create = async (e) => {
  e.preventDefault();
  try {
    await api.createProduct({
      ...form,
      basePrice: Number(form.basePrice),
      stock: Number(form.stock),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      images: form.images
        .split(',')
        .map((image) => image.trim())
        .filter(Boolean),
    });

    setForm(EMPTY);
    toast('Product added');
    reload();
  } catch (err) {
    toast(err.message);
  }
};

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

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
    <th>Stock</th>
    <th>Images</th>
    <th />
  </tr>
</thead>
            <tbody>
              {data.map((p) => (
                <tr key={p._id}>
                  <td><div className="row" style={{ flexWrap: 'nowrap' }}><span className="swatch-sm" style={{ background: swatchBg(p) }} />{p.name}</div></td>
                  <td><input className="mini" type="number" min="0" value={val(p, 'basePrice')} onChange={(e) => edit(p, 'basePrice', e.target.value)} /></td>
                  <td><input className="mini" type="number" min="0" value={val(p, 'stock')} onChange={(e) => edit(p, 'stock', e.target.value)} /></td>
                  <td>
  <input
    className="mini"
    type="text"
    placeholder="IMG_9773.JPG"
    value={val(p, 'images') ?? (p.images || []).join(', ')}
    onChange={(e) => edit(p, 'images', e.target.value)}
  />
</td>
                  <td><button className="btn sm" disabled={!edits[p._id]} onClick={() => save(p)}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="muted small">Size prices come from the base price (4×6 ft = 1.55×, 5×7 ft = 2.2×, custom = 2.6×).</p>
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
          <div className="field"><label>Stock</label><input type="number" min="0" value={form.stock} onChange={set('stock')} required /></div>
          <div className="field"><label>Tags (for recommendations)</label><input placeholder="living, privacy, mid" value={form.tags} onChange={set('tags')} /></div>
        </div>
        <div className="field"><label>Description</label><textarea rows={2} value={form.description} onChange={set('description')} /></div>
        <div className="field">
  <label>Product image filenames (comma-separated)</label>
  <textarea
    rows={3}
    value={form.images}
    onChange={set('images')}
    placeholder="IMG_9773.JPG, IMG_9775.JPG"
  />
  <small>Enter only the filenames, separated by commas.</small>
</div>
        <button className="btn">Add product</button>
      </form>
    </>
  );
}
