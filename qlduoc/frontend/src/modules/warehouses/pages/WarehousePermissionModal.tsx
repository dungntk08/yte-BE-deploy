import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Search } from 'lucide-react';
import { getAllUsers, getWarehouseUsers, assignUserToWarehouse, removeUserFromWarehouse } from '../services/warehouseService';
import { Warehouse } from '../models/Warehouse';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Props {
    warehouse: Warehouse;
    onClose: () => void;
}

const WarehousePermissionModal: React.FC<Props> = ({ warehouse, onClose }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [warehouse.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, assignedData] = await Promise.all([
                getAllUsers(),
                getWarehouseUsers(warehouse.id)
            ]);
            setAllUsers(usersData);
            setAssignedUsers(assignedData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (userId: string) => {
        try {
            await assignUserToWarehouse(warehouse.id, userId);
            fetchData(); // Refresh list
        } catch (error) {
            alert('Gán quyền thất bại');
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Bạn có chắc muốn xóa quyền của user này?')) return;
        try {
            await removeUserFromWarehouse(warehouse.id, userId);
            fetchData();
        } catch (error) {
            alert('Xóa quyền thất bại');
        }
    };

    // Filter users who are NOT assigned yet for the "Add" list
    const unassignedUsers = allUsers
        .filter(u => !assignedUsers.find(au => au.id === u.id))
        .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Phân quyền kho</h2>
                        <p className="text-gray-500 text-sm">{warehouse.name} ({warehouse.code})</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Assigned Users */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                            Đã cấp quyền
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{assignedUsers.length}</span>
                        </h3>
                        {/* List */}
                        <div className="space-y-2">
                             {assignedUsers.map(user => (
                                <div key={user.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                                    <div className="overflow-hidden">
                                        <div className="font-medium text-sm truncate">{user.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemove(user.id)}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                        title="Xóa quyền"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                             ))}
                             {assignedUsers.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Chưa có ai</p>}
                        </div>
                    </div>

                    {/* Right: Available Users */}
                    <div className="border rounded-lg p-4 flex flex-col">
                         <h3 className="font-semibold text-gray-700 mb-3">Thêm người dùng</h3>
                         <div className="relative mb-3">
                            <input 
                                type="text" 
                                placeholder="Tìm tên hoặc email..." 
                                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                         </div>
                         
                         <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
                            {unassignedUsers.map(user => (
                                <div key={user.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all">
                                    <div className="overflow-hidden">
                                        <div className="font-medium text-sm truncate">{user.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleAssign(user.id)}
                                        className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                                        title="Thêm quyền"
                                    >
                                        <UserPlus size={18} />
                                    </button>
                                </div>
                            ))}
                            {unassignedUsers.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Không tìm thấy</p>}
                         </div>
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehousePermissionModal;
