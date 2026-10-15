import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../services/settingsService';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};