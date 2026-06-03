import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Scissors, Users, Calendar, LayoutDashboard, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getAllSalons, createSalon, updateSalon, deleteSalon } from '../services/firestoreService';
import { Salon } from '../types';
import { AdminTable, TableColumn } from '../components/AdminTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';

export const AdminSalons: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [deleteSalonId, setDeleteSalonId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('20:00');

  // Security check
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const loadSalons = async () => {
    setLoading(true);
    try {
      const data = await getAllSalons();
      setSalons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalons();
  }, []);

  const openAddModal = () => {
    setEditingSalon(null);
    setName('');
    setArea('');
    setAddress('');
    setPhone('');
    setImage('');
    setDescription('');
    setOpenTime('09:00');
    setCloseTime('20:00');
    setIsFormModalOpen(true);
  };

  const openEditModal = (salon: Salon) => {
    setEditingSalon(salon);
    setName(salon.name);
    setArea(salon.area);
    setAddress(salon.address);
    setPhone(salon.phone);
    setImage(salon.image);
    setDescription(salon.description);
    setOpenTime(salon.operatingHours.open);
    setCloseTime(salon.operatingHours.close);
    setIsFormModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !area || !address || !phone || !description) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      name,
      area,
      address,
      phone,
      image: image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
      description,
      operatingHours: {
        open: openTime,
        close: closeTime
      },
      lat: 23.8, // Default coords
      lng: 90.4
    };

    try {
      if (editingSalon) {
        await updateSalon(editingSalon.id, payload);
        toast('Salon updated successfully!', 'success');
      } else {
        await createSalon(payload);
        toast('Salon added successfully!', 'success');
      }
      setIsFormModalOpen(false);
      loadSalons();
    } catch (err: any) {
      toast(err.message || 'Failed to save salon details.', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteSalonId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteSalonId) return;
    try {
      await deleteSalon(deleteSalonId);
      toast('Salon branch deleted successfully.', 'success');
      setDeleteSalonId(null);
      loadSalons();
    } catch (err: any) {
      toast(err.message || 'Failed to delete salon.', 'error');
    }
  };

  const columns: TableColumn<Salon>[] = [
    { header: 'Branch Name', accessor: 'name', className: 'font-bold text-gray-900' },
    { header: 'Area', accessor: 'area' },
    { header: 'Phone Number', accessor: 'phone' },
    { 
      header: 'Hours', 
      render: (item) => `${item.operatingHours.open} - ${item.operatingHours.close}` 
    },
    {
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1 hover:bg-gray-100 rounded text-primary transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(item.id)}
            className="p-1 hover:bg-gray-100 rounded text-error transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-gray-900 text-gray-400 flex flex-col border-r border-gray-800 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2 text-white font-bold text-lg">
            <Scissors className="h-5 w-5 text-primary rotate-90" />
            <span>DhakaCut Admin</span>
          </Link>
          <span className="text-[10px] text-primary-light font-medium tracking-wider uppercase mt-1 block">Management Suite</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Analytics Home</span>
          </Link>
          <Link
            to="/admin/salons"
            className="flex items-center gap-3 px-4 py-2.5 rounded bg-primary text-white font-semibold text-sm transition-colors"
          >
            <MapPin className="h-4.5 w-4.5 text-white" />
            <span>Manage Salons</span>
          </Link>
          <Link
            to="/admin/staff"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <Users className="h-4.5 w-4.5" />
            <span>Manage Staff</span>
          </Link>
          <Link
            to="/admin/services"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <Scissors className="h-4.5 w-4.5" />
            <span>Manage Services</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Manage Bookings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Salon Branch Management</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Register, edit, or remove business branch profiles.</p>
          </div>
          <Button size="sm" onClick={openAddModal} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Add branch
          </Button>
        </div>

        <AdminTable
          columns={columns}
          data={salons}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No branch records exist."
        />

        {/* ADD / EDIT MODAL */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={editingSalon ? `Edit branch profile` : 'Add new salon branch'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Salon Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Dhaka Cut Dhanmondi"
                required
              />
              <Input
                label="Area/Neighborhood"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="E.g., Dhanmondi"
                required
              />
            </div>
            
            <Input
              label="Full Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g., Sanmar Tower, Satmasjid Road, Dhanmondi, Dhaka"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="E.g., +880 1711 122255"
                required
              />
              <Input
                label="Header Image URL (Optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/salon.jpg"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Salon Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the salon branches capabilities and layout..."
                rows={3}
                className="w-full text-sm border border-gray-300 rounded p-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                required
              />
              <Input
                label="Closing Time"
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-150 pt-4">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                {editingSalon ? 'Save changes' : 'Add branch'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* DELETE CONFIRMATION */}
        <Modal
          isOpen={!!deleteSalonId}
          onClose={() => setDeleteSalonId(null)}
          title="Delete Salon Branch?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-error-light/10 border border-error text-error rounded-lg">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Warning</h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  Are you sure you want to delete this branch? All associated staff members, reviews, and client bookings will be deleted permanently.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end border-t border-gray-150 pt-4">
              <Button variant="outline" size="sm" onClick={() => setDeleteSalonId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Delete branch
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};
