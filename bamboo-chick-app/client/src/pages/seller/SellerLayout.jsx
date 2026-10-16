import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import DashboardLayout from '../../components/DashboardLayout.jsx';

export default function SellerLayout() {
  // badge with the number of open cancellation requests
  const { data } = useFetch(() => api.allOrders('Cancellation requested'), []);
  const tabs = [
    ['/seller', 'Overview'],
    ['/seller/orders', 'Order slips'],
    ['/seller/cancellations', 'Cancellations', data?.length || 0],
    ['/seller/products', 'Price & stock'],
    ['/seller/offers', 'Discounts & taxes'],
    ['/seller/reviews', 'Reviews'],
    ['/seller/blogs', 'Blogs'],
    ['/seller/report', 'Monthly report']
  ];
  return <DashboardLayout title="Seller dashboard" tabs={tabs} />;
}
