import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, MapPin, Users, Calendar, LayoutDashboard, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getAllServices, createService, updateService, deleteService, getAllSalons } from '../services/firestoreService';
import { Service, Salon } from '../types';
import { AdminTable, TableColumn } from '../components/AdminTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { formatCurrency, formatDuration } from '../utils/formatters';

export const AdminServices: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('250');
  const [duration, setDuration] = useState<string>('30');
  const [description, setDescription] = useState('');
  const [salonId, setSalonId] = useState('');
  const [category, setCategory] = useState<'Hair' | 'Beard' | 'Shave' | 'Color' | 'Treatment'>('Hair');
  const [salons, setSalons] = useState<Salon[]>([]);

  // Security check
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const [servicesData, salonsData] = await Promise.all([
        getAllServices(),
        getAllSalons()
      ]);
      setServices(servicesData);
      setSalons(salonsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setPrice('250');
    setDuration('30');
    setDescription('');
    setSalonId(salons[0]?.id || '');
    setCategory('Hair');
    setIsFormModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setPrice(String(service.price));
    setDuration(String(service.duration));
    setDescription(service.description);
    setSalonId(service.salonId || '');
    setCategory(service.category || 'Hair');
    setIsFormModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !duration || !description) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      salonId,
      category
    };

    try {
      if (editingService) {
        await updateService(editingService.id, payload);
        toast('Service details updated.', 'success');
      } else {
        await createService(payload);
        toast('New service added to catalog.', 'success');
      }
      setIsFormModalOpen(false);
      loadServices();
    } catch (err: any) {
      toast(err.message || 'Failed to save service.', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteServiceId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteServiceId) return;
    try {
      await deleteService(deleteServiceId);
      toast('Service deleted successfully.', 'success');
      setDeleteServiceId(null);
      loadServices();
    } catch (err: any) {
      toast(err.message || 'Failed to delete service.', 'error');
    }
  };

  const columns: TableColumn<Service>[] = [
    { header: 'Service Name', accessor: 'name', className: 'font-bold text-gray-900' },
    { 
      header: 'Branch Location',
      render: (item) => salons.find(s => s.id === item.salonId)?.name || 'All Branches'
    },
    {
      header: 'Category',
      render: (item) => <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full font-medium">{item.category}</span>
    },
    { 
      header: 'Description', 
      render: (item) => <span className="line-clamp-1 max-w-sm">{item.description}</span>
    },
    { 
      header: 'Standard Duration', 
      render: (item) => formatDuration(item.duration) 
    },
    { 
      header: 'Price Tag', 
      render: (item) => formatCurrency(item.price),
      className: 'font-semibold text-primary'
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

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
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <MapPin className="h-4.5 w-4.5" />
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
            className="flex items-center gap-3 px-4 py-2.5 rounded bg-primary text-white font-semibold text-sm transition-colors"
          >
            <Scissors className="h-4.5 w-4.5 text-white" />
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Service Catalog Management</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Define or modify styling services and pricing tiers.</p>
          </div>
          <Button size="sm" onClick={openAddModal} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>

        <AdminTable
          columns={columns}
          data={services}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No catalogued services offered."
        />

        {/* ADD / EDIT MODAL */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={editingService ? `Edit service profile` : 'Add new catalog service'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Service Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Charcoal Deep Cleansing Facial"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (BDT)"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250"
                required
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Salon Branch</label>
                <select
                  value={salonId}
                  onChange={(e) => setSalonId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2.5 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select Salon...</option>
                  {salons.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-sm border border-gray-300 rounded px-2.5 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="Hair">Hair</option>
                  <option value="Beard">Beard</option>
                  <option value="Shave">Shave</option>
                  <option value="Color">Color</option>
                  <option value="Treatment">Treatment</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Service Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of the service processes, shampoo, massage details..."
                rows={3}
                className="w-full text-sm border border-gray-300 rounded p-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                required
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-150 pt-4">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                {editingService ? 'Save changes' : 'Add Service'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* DELETE CONFIRMATION */}
        <Modal
          isOpen={!!deleteServiceId}
          onClose={() => setDeleteServiceId(null)}
          title="Delete Service Offering?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-error-light/10 border border-error text-error rounded-lg">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Warning</h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  Are you sure you want to delete this service? It will be removed from the selection menu for all salon locations.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end border-t border-gray-150 pt-4">
              <Button variant="outline" size="sm" onClick={() => setDeleteServiceId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Delete offering
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};
