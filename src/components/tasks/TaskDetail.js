import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectTaskById, 
  updateTask, 
  deleteTask, 
  addComment 
} from '../../features/tasks/tasksSlice';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const parsedTaskId = parseInt(taskId);
  const task = useSelector(state => selectTaskById(state, parsedTaskId));
  const { user, role } = useSelector(state => state.auth);
  
  const [comment, setComment] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  if (!task) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">Task not found</h2>
          <p className="mt-2 text-gray-600">The task you're looking for doesn't exist or has been removed.</p>
          <button
            className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/tasks')}
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Priority styling
  const priorityClass = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }[task.priority];
  
  // Status styling
  const statusClass = {
    'to-do': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800'
  }[task.status];
  
  // Users data for displaying names
  const users = [
    { id: 1, name: 'Admin User' },
    { id: 2, name: 'Regular User' },
    { id: 3, name: 'John Doe' }
  ];
  
  // Get user name by ID
  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };
  
  // Handle status change
  const handleStatusChange = (newStatus) => {
    dispatch(updateTask({
      id: parsedTaskId,
      status: newStatus
    }));
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (comment.trim()) {
      dispatch(addComment({
        taskId: parsedTaskId,
        userId: user.id,
        text: comment
      }));
      setComment('');
    }
  };
  
  // Handle task deletion
  const handleDelete = () => {
    dispatch(deleteTask(parsedTaskId));
    navigate('/tasks');
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      {/* Task Header */}
      <div className="border-b border-gray-200 pb-5 mb-5">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          
          <div className="flex items-center space-x-2">
            {/* Edit Button */}
            <button
              onClick={() => navigate(`/tasks/edit/${taskId}`)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {/* Delete Button */}
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClass}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {task.status === 'to-do' 
              ? 'To Do' 
              : task.status === 'in-progress' 
                ? 'In Progress' 
                : 'Completed'}
          </span>
          <span className="text-xs text-gray-500">
            Due: {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
      
      {/* Task Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
          </div>
          
          {/* Task Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Change Status</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('to-do')}
                disabled={task.status === 'to-do'}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  task.status === 'to-do'
                    ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                To Do
              </button>
              <button
                onClick={() => handleStatusChange('in-progress')}
                disabled={task.status === 'in-progress'}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-500 border-blue-300 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={task.status === 'completed'}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-500 border-green-300 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
          
          {/* Comments Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex">
                <textarea
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="px-4 py-2 border border-transparent border-l-0 rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  Post
                </button>
              </div>
            </form>
            
            {/* Comments List */}
            {task.comments.length > 0 ? (
              <div className="space-y-4">
                {task.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900">{getUserName(comment.userId)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-1 text-gray-700">{comment.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No comments yet</div>
            )}
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="bg-gray-50 p-4 rounded-lg h-fit">
          <h3 className="font-medium text-gray-900 mb-3">Assignment</h3>
          <div className="mb-4">
            <div className="text-sm text-gray-500">Assigned to</div>
            <div className="text-gray-900">{getUserName(task.assignedTo)}</div>
          </div>
          <div className="mb-4">
            <div className="text-sm text-gray-500">Assigned by</div>
            <div className="text-gray-900">{getUserName(task.assignedBy)}</div>
          </div>
          <div className="mb-4">
            <div className="text-sm text-gray-500">Created on</div>
            <div className="text-gray-900">{formatDate(task.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last updated</div>
            <div className="text-gray-900">{formatDate(task.updatedAt)}</div>
          </div>
        </div>
      </div>
      
      {/* Back Button */}
      <div className="mt-8 border-t border-gray-200 pt-4">
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tasks
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail; 