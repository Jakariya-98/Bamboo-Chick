import DashboardLayout from '../../components/DashboardLayout.jsx';

export default function AdminLayout() {
  const tabs = [
    ['/admin', 'System overview'],
    ['/admin/reviews', 'Reviews'],
    ['/admin/manufacturer', 'Manufacturer page'],
    ['/admin/users', 'Users']
  ];
  return <DashboardLayout title="Admin panel" tabs={tabs} />;
}
