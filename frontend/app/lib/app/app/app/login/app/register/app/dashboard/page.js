'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']),
});

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(taskSchema) });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        setUser(profileRes.data);
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, data);
        setTasks(tasks.map(t => t._id === editingTask._id ? res.data : t));
        setEditingTask(null);
      } else {
        const res = await api.post('/tasks', data);
        setTasks([...tasks, res.data]);
      }
      reset();
    } catch (err) {
      alert('Error saving task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    reset(task);
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (!filterStatus || t.status === filterStatus)
  );

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl">Dashboard - Welcome, {user.name}</h1>
        <button onClick={logout} className="bg-red-500 text-white p-2">Logout</button>
      </div>

      {/* Profile */}
      <div className="mb-8">
        <h2 className="text-xl">Profile</h2>
        <p>Email: {user.email}</p>
        <p>Name: {user.name}</p>
        {/* Update profile form can be added here similarly */}
      </div>

      {/* Task Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <input {...register('title')} placeholder="Title" className="border p-2 mr-2" />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        <input {...register('description')} placeholder="Description" className="border p-2 mr-2" />
        <select {...register('status')} className="border p-2 mr-2">
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit" className="bg-green-500 text-white p-2">{editingTask ? 'Update' : 'Create'} Task</button>
      </form>

      {/* Search/Filter */}
      <input 
        type="text" 
        placeholder="Search by title" 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="border p-2 mb-4 w-full" 
      />
      <select 
        value={filterStatus} 
        onChange={e => setFilterStatus(e.target.value)} 
        className="border p-2 mb-4"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Tasks Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task._id}>
              <td className="border p-2">{task.title}</td>
              <td className="border p-2">{task.description}</td>
              <td className="border p-2">{task.status}</td>
              <td className="border p-2">
                <button onClick={() => editTask(task)} className="bg-yellow-500 text-white p-1 mr-2">Edit</button>
                <button onClick={() => deleteTask(task._id)} className="bg-red-500 text-white p-1">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}