import DashboardLayout from '../../components/DashboardLayout.jsx';

export default function AdminLayout() {
  const tabs = [
    ['/admin', 'System overview'],
    ['/admin/reviews', 'Reviews'],
    ['/admin/manufacturer', 'Manufacturer page'],
    ['/admin/about', 'About Us content'],
    ['/admin/users', 'Users'],
    ['/admin/blogs', 'Blogs'],
    ['/admin/report', 'Monthly report']
  ];
  return <DashboardLayout title="Admin panel" tabs={tabs} />;
}