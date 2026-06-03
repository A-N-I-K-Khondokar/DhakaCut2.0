import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Scissors, Calendar, MapPin, LayoutDashboard, Plus, Edit, Trash2, AlertCircle, Star, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
  getAllSalons, 
  getStaffBySalon, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  getAllServices
} from '../services/firestoreService';
import { Salon, Staff, Service } from '../types';
import { AdminTable, TableColumn } from '../components/AdminTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';

export const AdminStaff: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [salons, setSalons] = useState<Salon[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState<number>(5);
  const [salonId, setSalonId] = useState('');
  const [image, setImage] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  // Security check
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load Salons and Services initially
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [salonsData, servicesData] = await Promise.all([
          getAllSalons(),
          getAllServices()
        ]);
        setSalons(salonsData);
        setServices(servicesData);
        if (salonsData.length > 0) {
          setSelectedSalonId(salonsData[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initializeData();
  }, []);

  // Fetch staff list whenever selectedSalonId changes
  const loadStaff = async () => {
    if (!selectedSalonId) return;
    setLoading(true);
    try {
      const data = await getStaffBySalon(selectedSalonId);
      setStaffList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [selectedSalonId]);

  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setPhone('');
    setExperience(5);
    setSalonId(selectedSalonId);
    setImage('');
    setSelectedSpecializations([]);
    setIsFormModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setName(staff.name);
    setPhone(staff.phone);
    setExperience(staff.experience);
    setSalonId(staff.salonId);
    setImage(staff.image);
    setSelectedSpecializations(staff.specialization);
    setIsFormModalOpen(true);
  };

  const handleCheckboxChange = (specName: string) => {
    setSelectedSpecializations(prev => 
      prev.includes(specName) 
        ? prev.filter(s => s !== specName) 
        : [...prev, specName]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !salonId) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    if (selectedSpecializations.length === 0) {
      toast('Please select at least one specialization.', 'error');
      return;
    }

    const payload = {
      name,
      phone,
      experience,
      salonId,
      image: image || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
      specialization: selectedSpecializations
    };

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, payload);
        toast('Staff member details saved.', 'success');
      } else {
        await createStaff(payload);
        toast('New staff member added.', 'success');
      }
      setIsFormModalOpen(false);
      loadStaff();
    } catch (err: any) {
      toast(err.message || 'Failed to save staff.', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteStaffId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteStaffId) return;
    try {
      await deleteStaff(deleteStaffId);
      toast('Stylist deleted from catalog.', 'success');
      setDeleteStaffId(null);
      loadStaff();
    } catch (err: any) {
      toast(err.message || 'Failed to delete staff member.', 'error');
    }
  };

  const getSalonName = (id: string) => {
    return salons.find(s => s.id === id)?.name || 'Unknown Branch';
  };

  const columns: TableColumn<Staff>[] = [
    {
      header: 'Stylist Name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-250 bg-gray-100 flex-shrink-0">
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          </div>
          <span className="font-bold text-gray-900">{item.name}</span>
        </div>
      )
    },
    {
      header: 'Branch Location',
      render: (item) => getSalonName(item.salonId)
    },
    { 
      header: 'Experience', 
      render: (item) => `${item.experience} years` 
    },
    {
      header: 'Performance Rating',
      render: (item) => (
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-gray-900">{item.avgRating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({item.reviewCount} reviews)</span>
        </span>
      )
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
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <MapPin className="h-4.5 w-4.5" />
            <span>Manage Salons</span>
          </Link>
          <Link
            to="/admin/staff"
            className="flex items-center gap-3 px-4 py-2.5 rounded bg-primary text-white font-semibold text-sm transition-colors"
          >
            <Users className="h-4.5 w-4.5 text-white" />
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Staff Management</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage branch stylists, set experience rates, and assign specialties.</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Salon Filter Selector */}
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48"
            >
              {salons.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            
            <Button size="sm" onClick={openAddModal} className="flex items-center gap-1.5 flex-shrink-0">
              <Plus className="h-4 w-4" />
              Add Stylist
            </Button>
          </div>
        </div>

        <AdminTable
          columns={columns}
          data={staffList}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No staff catalogued at this location."
        />

        {/* ADD / EDIT MODAL */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={editingStaff ? `Edit stylist profile` : 'Add new hair stylist / barber'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Kabir Khan"
                required
              />
              <Input
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="E.g., 01811223344"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Assign Salon Location</label>
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

              <Input
                label="Portrait Image URL (Optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Experience range selector */}
            <div className="flex flex-col gap-1.5 border border-gray-150 rounded p-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Experience Level</label>
                <span className="text-xs bg-primary text-white font-bold px-2 py-0.5 rounded">{experience} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={experience}
                onChange={(e) => setExperience(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Specializations checks */}
            <div className="space-y-2 border border-gray-150 rounded p-3 bg-gray-55">
              <label className="text-sm font-semibold text-gray-700 block">Select Specializations</label>
              {services.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No services listed to select specialities.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map(ser => (
                    <label key={ser.id} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSpecializations.includes(ser.name)}
                        onChange={() => handleCheckboxChange(ser.name)}
                        className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span>{ser.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-150 pt-4">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                {editingStaff ? 'Save changes' : 'Add stylist'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* DELETE CONFIRMATION */}
        <Modal
          isOpen={!!deleteStaffId}
          onClose={() => setDeleteStaffId(null)}
          title="Delete Stylist Profile?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-error-light/10 border border-error text-error rounded-lg">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Warning</h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  Are you sure you want to delete this staff member? All reviews written for them and bookings linked to their schedule will be deleted.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end border-t border-gray-150 pt-4">
              <Button variant="outline" size="sm" onClick={() => setDeleteStaffId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Delete profile
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};
