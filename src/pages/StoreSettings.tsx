import React, { useState, useEffect } from 'react';
import { initialStoreSettings, StoreSettings } from '../storeConfig';
import { Save, Store, MapPin, Phone, Loader2, Upload, X } from 'lucide-react';
import { api } from '../lib/api';

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then(data => {
      setSettings(prev => ({ ...prev, ...data }));
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.updateSettings({ 
      name: settings.name, 
      address: settings.address, 
      contact: settings.contact,
      logoUrl: settings.logoUrl,
      footerMessage: settings.footerMessage
    });
    setSaving(false);
    alert('Store settings saved successfully!');
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
      <Loader2 size={16} className="animate-spin" /> Loading Settings...
    </div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-6">Store Settings</h1>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Store Name</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded font-black text-xs uppercase tracking-widest outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded font-black text-xs uppercase tracking-widest outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Contact Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={settings.contact}
              onChange={(e) => setSettings({ ...settings, contact: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded font-black text-xs uppercase tracking-widest outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Store Logo</label>
          <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
            {settings.logoUrl ? (
              <div className="relative group">
                <img 
                  src={settings.logoUrl} 
                  alt="Store Logo" 
                  className="max-h-32 rounded object-contain bg-white p-2 border border-gray-200"
                />
                <button
                  onClick={() => setSettings({ ...settings, logoUrl: '' })}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <Store size={32} />
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                <Upload size={14} />
                {settings.logoUrl ? 'Change Logo' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSettings({ ...settings, logoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <p className="mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">JPG, PNG or SVG (Max 1MB Recommended)</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Footer Message</label>
          <textarea
            value={settings.footerMessage || ''}
            onChange={(e) => setSettings({ ...settings, footerMessage: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-black text-xs uppercase tracking-widest outline-none focus:border-orange-500"
          />
        </div>

        <button 
          disabled={saving}
          onClick={handleSave}
          className="w-full py-3 bg-gray-900 text-white rounded font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
