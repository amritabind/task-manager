'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from '../lib/axios'

export default function Dashboard() {
  const router = useRouter()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending' })
  const [editingTask, setEditingTask] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    fetchTasks()
  }, [router])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(data)
    } catch (err) {
      console.error('Failed to fetch tasks', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingTask) {
        await axios.put(`/tasks/${editingTask._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/tasks', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setFormData({ title: '', description: '', status: 'pending' })
      setEditingTask(null)
      setShowForm(false)
      fetchTasks()
    } catch (err) {
      console.error('Failed to save task', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTasks()
    } catch (err) {
      console.error('Failed to delete task', err)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({ title: task.title, description: task.description, status: task.status })
    setShowForm(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Task Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium flex items-center">
                <svg className="h-5 w-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Tasks</h2>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingTask(null)
                setFormData({ title: '', description: '', status: 'pending' })
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 font-medium flex items-center"
            >
              {showForm ? (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </>
              )}
            </button>
          </div>

          {showForm && (
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl mb-6 border border-purple-100 transform hover:scale-[1.02] transition-transform duration-200">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editingTask ? '✏️ Edit Task' : '✨ Create New Task'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  {editingTask ? '💾 Update Task' : '🚀 Create Task'}
                </button>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-lg text-center border-2 border-dashed border-purple-200">
                <svg className="mx-auto h-16 w-16 text-purple-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No tasks yet. Create your first task!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 border border-purple-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h3>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <span className={`inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' :
                        task.status === 'in-progress' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' :
                        'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'
                      }`}>
                        {task.status === 'completed' && '✅ '}
                        {task.status === 'in-progress' && '⏳ '}
                        {task.status === 'pending' && '📋 '}
                        {task.status}
                      </span>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg shadow-md transform hover:scale-110 transition-all duration-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg shadow-md transform hover:scale-110 transition-all duration-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
