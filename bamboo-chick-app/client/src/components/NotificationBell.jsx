import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import './NotificationBell.css';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ items: [], unread: 0 });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const root = useRef(null);

  const refresh = async () => {
    const current = ++generation.current;
    try {
      const result = await api.notifications();

      if (current === generation.current) {
        setData(result);
        setError('');
      }
    } catch (err) {
      if (current === generation.current) setError(err.message);
    }
  };

  useEffect(() => {
    void refresh();

    const timer = setInterval(refresh, 15000);

    return () => {
      clearInterval(timer);
      generation.current++;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const outside = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };

    const escape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector('button')?.focus();
      }
    };

    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);

    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const mark = async (id) => {
    setBusy(true);

    try {
      await (id ? api.readNotification(id) : api.readAllNotifications());
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bc-notifications" ref={root}>
      <button
        type="button"
        className="bc-notification-trigger"
        aria-label={`Notifications, ${data.unread} unread`}
        aria-expanded={open}
        aria-controls="bc-notification-panel"
        onClick={() => {
          setOpen(!open);
          if (!open) void refresh();
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {data.unread > 0 && (
          <span className="bc-notification-count">
            {data.unread > 99 ? '99+' : data.unread}
          </span>
        )}
      </button>

      {open && (
        <section
          id="bc-notification-panel"
          className="bc-notification-panel"
          aria-label="Notifications"
        >
          <div className="bc-notification-heading">
            <strong>Notifications</strong>

            <button
              type="button"
              disabled={busy || !data.unread}
              onClick={() => mark()}
            >
              Mark all read
            </button>
          </div>

          {error && (
            <p role="alert">
              {error}
              {' '}
              <button type="button" onClick={refresh}>Retry</button>
            </p>
          )}

          {!error && data.items.length === 0 && (
            <p>No notifications yet.</p>
          )}

          <ul>
            {data.items.map(item => (
              <li
                key={item._id}
                className={item.readAt ? '' : 'bc-notification-unread'}
              >
                <strong>{item.title}</strong>
                <p>{item.message}</p>

                <small>
                  {new Date(item.createdAt).toLocaleString()}
                </small>

                <div className="bc-notification-actions">
                  {item.link && (
                    <Link
                      to={item.link}
                      onClick={() => {
                        if (!item.readAt) void mark(item._id);
                        setOpen(false);
                      }}
                    >
                      View
                    </Link>
                  )}

                  {!item.readAt && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => mark(item._id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}