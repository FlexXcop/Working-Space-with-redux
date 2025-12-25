import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectTasksByStatus, 
  updateTask, 
  deleteTask, 
  selectAllTasks,
  selectMyTasksByStatus
} from '../features/tasks/tasksSlice';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetail from '../components/tasks/TaskDetail';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';

// TaskCard Component
const TaskCard = ({ task, onDragStart, onClick }) => {
  const priorityClasses = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  
  return (
    <div
      className="bg-white p-4 rounded-lg shadow mb-3 border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 truncate" title={task.title}>
          {task.title}
        </h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityClasses[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={task.description}>
        {task.description}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div>
          {task.comments.length > 0 && (
            <span className="flex items-center mr-3">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {task.comments.length}
            </span>
          )}
        </div>
        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// TaskColumn Component
const TaskColumn = ({ title, tasks, status, onDrop, onTaskClick }) => {
  const dispatch = useDispatch();
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e) => {
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(parseInt(taskId), status);
  };
  
  return (
    <div 
      className="bg-gray-100 p-3 rounded-lg w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-700">{title}</h2>
        <span className="text-sm font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard 
            key={task.id}
            task={task}
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id);
            }}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
};

// Mock users data for the assignee filter and task report
const KanbanBoard = () => {
  const users = [
    { id: 1, name: 'Admin User' },
    { id: 2, name: 'Regular User' },
    { id: 3, name: 'John Doe' }
  ];

// KanbanBoard Component

  const allTasksByStatus = useSelector(selectTasksByStatus);
  const myTasksByStatus = useSelector(selectMyTasksByStatus);
  const allTasks = useSelector(selectAllTasks);
  const { role, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showPersonalTasks, setShowPersonalTasks] = useState(false);
  
  // Determine which tasks to show based on view mode
  const tasksByStatus = showPersonalTasks ? myTasksByStatus : allTasksByStatus;
  
  const handleDrop = (taskId, newStatus) => {
    dispatch(updateTask({ id: taskId, status: newStatus }));
  };
  
  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.id}`);
  };
  
  const toggleTaskView = () => {
    setShowPersonalTasks(!showPersonalTasks);
    // Reset filters when switching views
    setAssigneeFilter('all');
  };
  
  // Export tasks to PDF
  const exportTasksToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Task Management Report', 14, 22);
    
    // Add date and report type
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Report Type: ${showPersonalTasks ? 'My Tasks' : 'All Tasks'}`, 14, 38);
    
    // Filter tasks based on view and filters
    let tasksToExport = showPersonalTasks ? 
      allTasks.filter(task => task.assignedTo === user.id) : 
      [...allTasks];
      
    if (assigneeFilter !== 'all' && !showPersonalTasks) {
      tasksToExport = tasksToExport.filter(task => 
        task.assignedTo === parseInt(assigneeFilter)
      );
    }
    
    if (statusFilter !== 'all') {
      tasksToExport = tasksToExport.filter(task => task.status === statusFilter);
    }
    
    // Prepare tasks table data
    const tasksData = tasksToExport.map(task => [
      task.id,
      task.title,
      task.status === 'to-do' ? 'To Do' : 
        task.status === 'in-progress' ? 'In Progress' : 'Completed',
      task.priority,
      new Date(task.dueDate).toLocaleDateString(),
      users.find(u => u.id === task.assignedTo)?.name || 'Unknown'
    ]);
    
    // Add tasks table
    doc.setFontSize(16);
    doc.text('Tasks Overview', 14, 48);
    
    doc.autoTable({
      startY: 52,
      head: [['ID', 'Title', 'Status', 'Priority', 'Due Date', 'Assigned To']],
      body: tasksData,
    });
    
    // Add task stats section
    const taskStatsY = doc.previousAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Task Status Summary', 14, taskStatsY);
    
    // Task statistics data based on the current view
    const todoCount = tasksByStatus.todo.length;
    const inProgressCount = tasksByStatus.inProgress.length;
    const completedCount = tasksByStatus.completed.length;
    const totalCount = todoCount + inProgressCount + completedCount;
    
    const statsData = [
      ['To Do', todoCount.toString(), totalCount > 0 ? `${((todoCount / totalCount) * 100).toFixed(1)}%` : '0%'],
      ['In Progress', inProgressCount.toString(), totalCount > 0 ? `${((inProgressCount / totalCount) * 100).toFixed(1)}%` : '0%'],
      ['Completed', completedCount.toString(), totalCount > 0 ? `${((completedCount / totalCount) * 100).toFixed(1)}%` : '0%'],
      ['Total', totalCount.toString(), '100%']
    ];
    
    doc.autoTable({
      startY: taskStatsY + 5,
      head: [['Status', 'Count', 'Percentage']],
      body: statsData,
    });
    
    // Save the PDF
    doc.save(`${showPersonalTasks ? 'my' : 'all'}-tasks-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  // Prepare CSV data for export
  const tasksCSVData = [
    ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assigned To', 'Comments'],
    ...(showPersonalTasks ? 
      allTasks.filter(task => task.assignedTo === user.id) : 
      allTasks).map(task => [
      task.id,
      task.title,
      task.description,
      task.status === 'to-do' ? 'To Do' : 
        task.status === 'in-progress' ? 'In Progress' : 'Completed',
      task.priority,
      new Date(task.dueDate).toLocaleDateString(),
      users.find(u => u.id === task.assignedTo)?.name || 'Unknown',
      task.comments.length
    ])
  ];
  
  
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {showPersonalTasks ? 'My Tasks' : 'Task Board'}
          </h1>
          <button
            className="ml-3 px-2 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
            onClick={toggleTaskView}
          >
            {showPersonalTasks ? 'Show All Tasks' : 'Show My Tasks'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Task
          </Link>
          <div className="dropdown relative">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <div className="dropdown-menu hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <button
                  onClick={exportTasksToPDF}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                >
                  Export to PDF
                </button>
                <CSVLink
                  data={tasksCSVData}
                  filename={`${showPersonalTasks ? 'my' : 'all'}-tasks-${new Date().toISOString().slice(0, 10)}.csv`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                >
                  Export to CSV
                </CSVLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter controls - Only show assignee filter when viewing all tasks */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4">
          {!showPersonalTasks && (
            <div>
              <label htmlFor="assigneeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                id="assigneeFilter"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TaskColumn 
          title="To Do" 
          tasks={statusFilter === 'all' || statusFilter === 'to-do' 
            ? (assigneeFilter === 'all' || showPersonalTasks
                ? tasksByStatus.todo 
                : allTasksByStatus.todo.filter(task => task.assignedTo === parseInt(assigneeFilter)))
            : []}
          status="to-do"
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
        />
        <TaskColumn 
          title="In Progress" 
          tasks={statusFilter === 'all' || statusFilter === 'in-progress' 
            ? (assigneeFilter === 'all' || showPersonalTasks
                ? tasksByStatus.inProgress 
                : allTasksByStatus.inProgress.filter(task => task.assignedTo === parseInt(assigneeFilter)))
            : []}
          status="in-progress"
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
        />
        <TaskColumn 
          title="Completed" 
          tasks={statusFilter === 'all' || statusFilter === 'completed' 
            ? (assigneeFilter === 'all' || showPersonalTasks
                ? tasksByStatus.completed 
                : allTasksByStatus.completed.filter(task => task.assignedTo === parseInt(assigneeFilter)))
            : []}
          status="completed"
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
        />
      </div>
    </div>
  );
};

// Main Tasks Page component
const TasksPage = () => {
  return (
    <Routes>
      <Route path="/" element={<KanbanBoard />} />
      <Route path="/new" element={<TaskForm />} />
      <Route path="/:taskId" element={<TaskDetail />} />
    </Routes>
  );
};

export default TasksPage; 