import { useCallback, useEffect, useState } from 'react';

/**
 * const { data, error, loading, reload, setData } = useFetch(() => api.products(), [deps])
 */
export default function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await load()); }
    catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [load]);

  useEffect(() => { reload(); }, [reload]);

  return { data, error, loading, reload, setData };
}
