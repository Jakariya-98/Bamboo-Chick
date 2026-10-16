import { api } from '../../api/client.js';
import useFetch from '../../utils/useFetch.js';
import { date } from '../../utils/format.js';
import Loading, { ErrorBox } from '../../components/Loading.jsx';

export default function AdminUsers() {
  const { data, error, loading } = useFetch(() => api.users(), []);
  return (
    <div className="card pad tablewrap">
      <h3>Users</h3>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td>
                <td><span className={`pill ${u.role === 'buyer' ? 'grey' : ''}`}>{u.role}</span></td>
                <td>{date(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
