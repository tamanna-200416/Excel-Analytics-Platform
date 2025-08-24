import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';

const ProfilePage: React.FC = () => {
  const { user, authFetch, setUser } = useAuth() as any;
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 512,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setAvatar(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
      } catch (err) {
        toast.error('Image compression failed.');
        console.error('Compression error:', err);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', username);
      if (password) formData.append('password', password);
      if (avatar) formData.append('avatar', avatar);

      const response = await authFetch('http://localhost:4000/api/auth/update-profile', {
        method: 'PUT',
        body: formData,
      });

      setUser((prev: any) => ({
        ...prev,
        username: response.user.username,
        avatar: response.user.avatar,
      }));

      toast.success('✅ Profile updated successfully!');
      setPassword('');
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-gray-900 pt-24 px-4">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-blue-700 dark:text-white mb-6 text-center">Edit Profile</h2>

        {preview && (
          <div className="flex justify-center mb-4">
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover ring-2 ring-blue-400 shadow"
            />
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-300
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 dark:file:bg-gray-700 dark:hover:file:bg-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
