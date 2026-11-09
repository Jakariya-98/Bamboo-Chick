import { Link } from 'react-router-dom';
import useFetch from '../utils/useFetch.js';
import { api } from '../api/client.js';
import BlogCard from '../components/BlogCard.jsx';
import Loading, { ErrorBox } from '../components/Loading.jsx';

export default function Manufacturer() {
  const page = useFetch(() => api.manufacturer(), []);
  const blogs = useFetch(() => api.blogs(), []);

  return <>
    <section className="manufacturer-hero">
      <span className="pill">Handmade in Bangladesh</span>
      <h1>{page.data?.title || 'About Bamboo Chick'}</h1>
      <p className="muted">Learn about our work, materials, and the people who make our bamboo curtains.</p>
    </section>

    <ErrorBox error={page.error} />
    {page.loading ? <Loading /> : <section className="card pad manufacturer-story"><h2>Our story</h2><p>{page.data?.description}</p><div className="row"><span className="pill">Workshop in Dhaka</span><span className="pill">Natural materials</span><span className="pill">Made with care</span></div></section>}

    <section className="section"><div className="spread"><h2>Workshop pictures and videos</h2><Link to="/shop" className="btn ghost sm">Explore curtains</Link></div>
      {(page.data?.media || []).length ? <div className="grid g3 manufacturer-gallery">{page.data.media.map((item) => <article className="card media-card" key={item._id}>{item.type === 'video' ? <video src={item.url} controls preload="metadata" /> : <img src={item.url} alt={item.title || 'Bamboo Chick workshop'} loading="lazy" />}<div className="pad"><b>{item.title || (item.type === 'video' ? 'Workshop video' : 'Workshop picture')}</b></div></article>)}</div> : <div className="card pad"><p className="muted">Pictures and videos from our workshop will appear here.</p></div>}
    </section>

    <section className="section"><div className="spread"><h2>Stories from our manufacturer</h2><Link to="/blog" className="btn ghost sm">All blogs →</Link></div>
      {blogs.loading ? <Loading /> : <div className="grid g3">{(blogs.data || []).slice(0, 6).map((b) => <BlogCard key={b._id} blog={b} />)}</div>}
    </section>
  </>;
}
