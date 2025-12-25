import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addTask, updateTask, selectTaskById } from '../../features/tasks/tasksSlice';

const TaskForm = ({ editMode = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { user, role } = useSelector(state => state.auth);
  const existingTask = useSelector(state => 
    editMode ? selectTaskById(state, parseInt(taskId)) : null
  );
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'to-do',
    priority: 'medium',
    dueDate: new Date().toISOString().slice(0, 10),
    assignedTo: user.id,
    assignedBy: user.id
  });
  
  // Load existing task data when in edit mode
  useEffect(() => {
    if (editMode && existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description,
        status: existingTask.status,
        priority: existingTask.priority,
        dueDate: existingTask.dueDate,
        assignedTo: existingTask.assignedTo,
        assignedBy: existingTask.assignedBy
      });
    }
  }, [editMode, existingTask]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editMode) {
      dispatch(updateTask({
        id: parseInt(taskId),
        ...formData
      }));
    } else {
      dispatch(addTask(formData));
    }
    
    navigate('/tasks');
  };
  
  // Get list of all users for the assignee dropdown
  const users = [
    { id: 1, name: 'Admin User' },
    { id: 2, name: 'Regular User' },
    { id: 3, name: 'John Doe' }
  ];
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editMode ? 'Edit Task' : 'Create New Task'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
          
          {/* Assigned To */}
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.assignedTo}
              onChange={handleChange}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editMode ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm; 