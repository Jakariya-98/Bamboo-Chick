
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startEditing = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const result = await api.updateProfile(form);
      updateUser(result.user);
      setEditing(false);
      showToast('Profile updated successfully');
    } catch (error) {
      showToast(error.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="container">
      <div className="page-head">
        <div>
          <p className="muted">Your account</p>
          <h1>My Profile</h1>
          <p className="muted">View and manage your personal information.</p>
        </div>
      </div>

      <div className="card pad">
        {!editing ? (
          <>
            <div className="profile-details">
              <div className="field">
                <label>Full Name</label>
                <p>{user?.name || 'Not provided'}</p>
              </div>

              <div className="field">
                <label>Email Address</label>
                <p>{user?.email || 'Not provided'}</p>
              </div>

              <div className="field">
                <label>Phone Number</label>
                <p>{user?.phone || 'Not provided'}</p>
              </div>

              <div className="field">
                <label>Address</label>
                <p>{user?.address || 'Not provided'}</p>
              </div>
            </div>

            <div className="row">
              <button className="btn" onClick={startEditing}>
                Edit Profile
              </button>
              <Link className="btn secondary" to="/orders">
                My Orders
              </Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Email Address</label>
              <input value={user?.email || ''} disabled />
              <small className="muted">Email address cannot be changed here.</small>
            </div>

            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="field">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
              />
            </div>

            <div className="row">
              <button className="btn" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
