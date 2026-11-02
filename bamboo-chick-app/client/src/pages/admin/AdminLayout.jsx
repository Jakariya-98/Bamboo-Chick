import DashboardLayout from '../../components/DashboardLayout.jsx';

export default function AdminLayout() {
  const tabs = [
    ['/admin', 'System overview'],
    ['/admin/reviews', 'Reviews'],
    ['/admin/users', 'Users']
  ];
  return <DashboardLayout title="Admin panel" tabs={tabs} />;
}
