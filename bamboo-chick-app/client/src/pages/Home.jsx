import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../utils/useFetch.js';
import { slats } from '../utils/swatch.js';
import ProductCard from '../components/ProductCard.jsx';
import BlogCard from '../components/BlogCard.jsx';
import RecommendationQuiz from '../components/RecommendationQuiz.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

export default function Home() {
  const products = useFetch(() => api.products(), []);
  const blogs = useFetch(() => api.blogs(), []);

  return (
    <>
      <section className="hero">
        <div>
          <span className="pill">Eco-conscious · Handmade in Bangladesh</span>
          <h1 style={{ marginTop: 14 }}>Natural bamboo curtains, made for your windows.</h1>
          <p>Bamboo Chick crafts premium natural and bamboo window curtains and helps you choose the right one with free design consultation.</p>
          <div className="row" style={{ marginTop: 20 }}>
            <Link className="btn" to="/shop">Shop curtains</Link>
            <a className="btn ghost" href="#quiz">Find my fit</a>
          </div>
        </div>
        <div className="heroart">
          <div className="blind" style={{ background: slats('natural') }} />
          <div className="pot" /><div className="plant" />
        </div>
      </section>

      <section className="section grid g3">
        <div className="card pad"><h3>🌿 Sustainable</h3><p className="muted" style={{ margin: 0 }}>Fast-growing bamboo, natural dyes and cotton cords — no plastic slats.</p></div>
        <div className="card pad"><h3>📐 Made to measure</h3><p className="muted" style={{ margin: 0 }}>Standard sizes ship in days; custom sizes are cut for your exact window.</p></div>
        <div className="card pad"><h3>🛠 Fitting service</h3><p className="muted" style={{ margin: 0 }}>Our team installs across Dhaka. Book it at checkout.</p></div>
      </section>

      <section className="section">
        <div className="spread"><h2>Bestsellers</h2><Link className="btn ghost sm" to="/shop">View all →</Link></div>
        <ErrorBox error={products.error} />
        {products.loading ? <Loading /> : (
          <div className="grid g4" style={{ marginTop: 14 }}>
            {(products.data || []).slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      <RecommendationQuiz />

      {/* "Read manufacturer description" user story — replace with the client's real text */}
      <section className="section grid g2" style={{ alignItems: 'center' }} id="about">
        <div className="heroart" style={{ height: 260 }}><div className="blind" style={{ background: slats('walnut') }} /></div>
        <div>
          <h2>About the manufacturer</h2>
          <p className="muted">Bamboo Chick is a premium interior design and sustainable curtain manufacturer specialised in natural and bamboo window curtains. We bring eco-conscious elegance to homes and offices through curated products and expert design consultations.</p>
          <div className="row"><span className="pill">Workshop in Dhaka</span><span className="pill">Free consultation</span></div>
        </div>
      </section>

      <section className="section">
        <div className="spread"><h2>From the blog</h2><Link className="btn ghost sm" to="/blog">All posts →</Link></div>
        <div className="grid g3" style={{ marginTop: 14 }}>
          {(blogs.data || []).slice(0, 3).map((b) => <BlogCard key={b._id} blog={b} />)}
        </div>
      </section>
    </>
  );
}
