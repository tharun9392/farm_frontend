import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import userService from '../../services/userService';
import { toast } from 'react-toastify';

const AddressesPage = () => {
  const [address, setAddress] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserProfile();
        setAddress(data.address || null);
        setForm({
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          postalCode: data.address?.postalCode || '',
          country: data.address?.country || 'India',
        });
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load address');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => setEditing(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.updateProfile({ address: form });
      setAddress(form);
      setEditing(false);
      toast.success('Address updated successfully');
      setLoading(false);
    } catch (err) {
      toast.error('Failed to update address');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-10 min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Your Address</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : editing ? (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Street</label>
              <input type="text" name="street" value={form.street} onChange={handleChange} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} className="input w-full" required />
            </div>
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        ) : address ? (
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <div className="mb-4">
              <div className="text-lg font-semibold text-gray-800">{address.street}</div>
              <div className="text-gray-700">{address.city}, {address.state} {address.postalCode}</div>
              <div className="text-gray-700">{address.country}</div>
            </div>
            <button onClick={handleEdit} className="btn btn-primary">Edit Address</button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
            <p className="text-gray-500 mb-4">No address found.</p>
            <button onClick={handleEdit} className="btn btn-primary">Add Address</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddressesPage; 