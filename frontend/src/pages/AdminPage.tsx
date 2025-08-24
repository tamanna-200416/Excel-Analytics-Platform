import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileSpreadsheet,
  HardDrive,
  Search,
  Trash,
} from 'lucide-react';
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  fileCount: number;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔁 Reusable fetchUsers
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/auth/all-users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const handleDelete = (id: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600 w-72">
          <p className="font-medium mb-4">
            Are you sure you want to delete this user?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                deleteUser(id);
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm px-4 py-2 rounded text-gray-800 dark:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/auth/delete-user/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to delete user';
        try {
          const json = JSON.parse(text);
          message = json.message || message;
        } catch {
          message = text;
        }
        throw new Error(message);
      }

      toast.success('✅ User deleted successfully');
      await fetchUsers(); // 🔁 Refresh user list + file counts
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users and monitor system usage
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
              <FileSpreadsheet size={24} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Files
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {users.reduce((sum, u) => sum + (u.fileCount || 0), 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <HardDrive size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Storage Used
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                168.3 MB
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                of 10 GB allocated
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-purple-600 h-1.5 rounded-full"
                  style={{ width: '1.68%' }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* User Table */}
      <Card className="mb-12 bg-white dark:bg-gray-800">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">
              User Management
            </CardTitle>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 w-full md:w-60 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['User', 'Role', 'Verified', 'Files', 'Actions'].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users
                  .filter((u) => {
                    const query = searchTerm.toLowerCase();
                    return (
                      u.username?.toLowerCase().includes(query) ||
                      u.email?.toLowerCase().includes(query)
                    );
                  })
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <Users size={20} className="text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.role === 'admin' ? (
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            Admin
                          </span>
                        ) : (
                          'User'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.isVerified
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {user.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.fileCount ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition"
                            title="Delete user"
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
