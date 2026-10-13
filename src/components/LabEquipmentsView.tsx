import React, { useState } from 'react';
import { Equipment } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  Cpu,
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface LabEquipmentsViewProps {
  equipments: Equipment[];
  onRefreshEquipment: () => void;
}

export const LabEquipmentsView: React.FC<LabEquipmentsViewProps> = ({
  equipments,
  onRefreshEquipment
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity'>('name');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    equipment_name: '',
    equipment_code: '',
    description: '',
    quantity: 1,
    availability_status: 'Available' as 'Available' | 'In Use' | 'Under Maintenance',
    location: 'Room 402 - Advanced AI & DS Lab',
    image_url: ''
  });

  // Calculate Status Counts
  const totalUnits = equipments.reduce((acc, curr) => acc + curr.quantity, 0);
  const availableCount = equipments.filter(e => e.availability_status === 'Available').length;
  const inUseCount = equipments.filter(e => e.availability_status === 'In Use').length;
  const maintenanceCount = equipments.filter(e => e.availability_status === 'Under Maintenance').length;

  const handleOpenAdd = () => {
    setFormData({
      equipment_name: '',
      equipment_code: `EQ-DS-${Math.floor(10 + Math.random() * 90)}`,
      description: '',
      quantity: 1,
      availability_status: 'Available',
      location: 'Room 402 - DS Lab',
      image_url: ''
    });
    setEditingEq(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingEq(eq);
    setFormData({
      equipment_name: eq.equipment_name,
      equipment_code: eq.equipment_code,
      description: eq.description,
      quantity: eq.quantity,
      availability_status: eq.availability_status,
      location: eq.location,
      image_url: eq.image_url || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEq) {
        await api.updateEquipment(editingEq.id, formData);
        setFeedback({ type: 'success', message: 'Equipment updated successfully.' });
      } else {
        await api.addEquipment(formData);
        setFeedback({ type: 'success', message: 'New equipment added to lab inventory.' });
      }
      setIsAddModalOpen(false);
      onRefreshEquipment();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteEquipment(id);
      setDeleteConfirmId(null);
      onRefreshEquipment();
      setFeedback({ type: 'success', message: 'Equipment removed from inventory.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: String(err) });
    }
  };

  // Filter & Sort
  const filtered = equipments.filter(e => {
    const matchesStatus = statusFilter === 'all' || e.availability_status === statusFilter;
    const matchesSearch =
      e.equipment_name.toLowerCase().includes(search.toLowerCase()) ||
      e.equipment_code.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.equipment_name.localeCompare(b.equipment_name);
    return b.quantity - a.quantity;
  });

  const getStatusBadge = (status: Equipment['availability_status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Available</span>
          </span>
        );
      case 'In Use':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>In Use</span>
          </span>
        );
      case 'Under Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Maintenance</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Lab Equipment & Hardware Inventory</span>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {equipments.length} Models ({totalUnits} Units)
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Workstations, edge AI kits, GPU clusters, and IoT measurement instruments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-600 block">Total Models</span>
          <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">{equipments.length}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-800 block">Available</span>
          <span className="text-lg font-bold font-mono text-emerald-900 tabular-nums">{availableCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-blue-800 block">In Active Use</span>
          <span className="text-lg font-bold font-mono text-blue-900 tabular-nums">{inUseCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-amber-800 block">Under Maintenance</span>
          <span className="text-lg font-bold font-mono text-amber-900 tabular-nums">{maintenanceCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({equipments.length})
          </button>
          <button
            onClick={() => setStatusFilter('Available')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'Available' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setStatusFilter('In Use')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'In Use' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Use ({inUseCount})
          </button>
          <button
            onClick={() => setStatusFilter('Under Maintenance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'Under Maintenance' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maintenance ({maintenanceCount})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
          <button
            onClick={() => setSortBy(sortBy === 'name' ? 'quantity' : 'name')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>Sort: {sortBy === 'name' ? 'Name' : 'Qty'}</span>
          </button>

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search gear..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Equipment Details</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {eq.equipment_code}
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-bold text-slate-900">{eq.equipment_name}</div>
                    <p className="text-slate-600 line-clamp-1 mt-0.5">{eq.description}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-center tabular-nums text-slate-800">
                    {eq.quantity}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(eq.availability_status)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{eq.location}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title="Edit Equipment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(eq.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-600">
                    <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">No equipment records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEq ? 'Edit Equipment Record' : 'Register New Lab Equipment'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Precision 3660 Workstation"
                  value={formData.equipment_name}
                  onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="EQ-DS-01"
                    value={formData.equipment_code}
                    onChange={(e) => setFormData({ ...formData, equipment_code: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.availability_status}
                  onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 402 - Server Rack C"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Technical specifications, serials, and peripherals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800"
                >
                  {editingEq ? 'Save Changes' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Remove Equipment Record</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove this piece of equipment from the laboratory inventory?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
