import React, { useState, useEffect } from 'react';
import { initialStoreSettings, StoreSettings } from '../storeConfig';
import { Save, Store, MapPin, Phone, Loader2, Upload, X, Users, UserPlus, Trash2, Edit2, Shield, User as UserIcon } from 'lucide-react';
import { api, User } from '../lib/api';
import { cn } from '../lib/utils';

export default function StoreSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([api.getSettings(), api.getUsers()]).then(([settingsData, usersData]) => {
      setSettings(prev => ({ ...prev, ...settingsData }));
      setUsers(usersData);
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ 
        name: settings.name, 
        address: settings.address, 
        contact: settings.contact,
        logoUrl: settings.logoUrl,
        footerMessage: settings.footerMessage
      });
      alert('Store settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      password: (formData.get('password') as string) || undefined,
      role: formData.get('role') as 'admin' | 'cashier'
    };

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id!, newUser);
      } else {
        await api.addUser(newUser);
      }
      const updatedUsers = await api.getUsers();
      setUsers(updatedUsers);
      setShowAddUser(false);
      setEditingUser(null);
    } catch (err) {
      alert('Failed to save user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
      <Loader2 size={16} className="animate-spin" /> Loading System Data...
    </div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">System Configuration</h1>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('general')}
            className={cn(
              "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'general' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            General Settings
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'users' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Staff Management
          </button>
        </div>
      </div>

      {activeTab === 'general' ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Store Logo</label>
              <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors h-[216px] justify-center">
                {settings.logoUrl ? (
                  <div className="relative group">
                    <img 
                      src={settings.logoUrl} 
                      alt="Store Logo" 
                      className="max-h-24 rounded object-contain bg-white p-2 border border-gray-200"
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
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Receipt Footer Message</label>
            <textarea
              value={settings.footerMessage || ''}
              onChange={(e) => setSettings({ ...settings, footerMessage: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-black text-xs uppercase tracking-widest outline-none focus:border-orange-500 h-24 resize-none"
              placeholder="Thank you for shopping with us!"
            />
          </div>

          <button 
            disabled={saving}
            onClick={handleSaveSettings}
            className="w-full py-3 bg-gray-900 text-white rounded font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 high-density-shadow"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving System Changes...' : 'Applied Settings'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-xs font-black text-gray-900 uppercase">{user.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs font-mono text-gray-500">{user.username}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                            user.role === 'admin' 
                              ? "bg-red-50 border-red-200 text-red-600" 
                              : "bg-blue-50 border-blue-200 text-blue-600"
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2">
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setShowAddUser(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id!)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  {editingUser ? <Edit2 size={18} /> : <UserPlus size={18} />}
                  <h2 className="text-sm font-black uppercase tracking-widest">{editingUser ? 'Edit Staff' : 'Add New Staff'}</h2>
                </div>
                
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <label>Full Name</label>
                    <input 
                      name="name"
                      defaultValue={editingUser?.name}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded outline-none focus:border-orange-500 font-bold text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <label>Username</label>
                    <input 
                      name="username"
                      defaultValue={editingUser?.username}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded outline-none focus:border-orange-500 font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <label>{editingUser ? 'Change Password' : 'Password'}</label>
                    <input 
                      name="password"
                      type="password"
                      placeholder={editingUser ? 'Leave blank to keep' : '••••••••'}
                      required={!editingUser}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded outline-none focus:border-orange-500 font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <label>Role</label>
                    <select 
                      name="role"
                      defaultValue={editingUser?.role || 'cashier'}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded outline-none focus:border-orange-500 font-bold text-xs appearance-none"
                    >
                      <option value="cashier">CASHIER (POS ACCESS ONLY)</option>
                      <option value="admin">ADMIN (FULL CONTROL)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingUser && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingUser(null);
                          setShowAddUser(false);
                        }}
                        className="flex-1 py-2 border border-gray-300 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="flex-[2] py-2 bg-orange-600 text-white rounded font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 shadow-sm"
                    >
                      {editingUser ? 'Update Staff Member' : 'Create Staff Account'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-gray-100 p-4 rounded border border-gray-200">
                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Access Control</p>
                    <p className="text-[9px] text-gray-400 leading-relaxed uppercase font-bold">
                      ADMINS HAVE FULL ACCESS TO INVENTORY, REPORTS, AND SYSTEM SETTINGS. CASHIERS ARE RESTRICTED TO POS AND SALES HISTORY.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
