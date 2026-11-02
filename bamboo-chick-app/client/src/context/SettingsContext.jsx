import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';

/** Store settings (VAT, delivery, offer, sizes) loaded once from the API. */
const SettingsContext = createContext(null);

const FALLBACK = {
  vatRate: 15, installVatRate: 5, installRate: 350,
  delivery: { dhaka: 120, outside: 250 },
  discount: { active: false, minQty: 3, pct: 0 },
  sizes: [{ key: '3x5', label: '3×5 ft', multiplier: 1 }]
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const reload = useCallback(() => api.settings().then(setSettings).catch(() => {}), []);
  useEffect(() => { reload(); }, [reload]);
  return <SettingsContext.Provider value={{ settings, setSettings, reload }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
