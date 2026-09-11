const { pool } = require('../config/db');

/**
 * Get all tasks belonging to projects owned by the authenticated user
 * Supports ?search=... &status=... &priority=... &projectId=...
 * GET /api/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, status, priority, projectId } = req.query;

    let query = `
      SELECT 
        t.id,
        t.project_id AS projectId,
        p.name AS projectName,
        t.name,
        t.description,
        t.priority,
        t.status,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS dueDate,
        t.created_at AS createdAt
      FROM tasks t
      INNER JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ?
    `;

    const params = [userId];

    if (projectId) {
      query += ' AND t.project_id = ?';
      params.push(projectId);
    }

    if (search && search.trim()) {
      query += ' AND t.name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (status && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += " ORDER BY (CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END), t.due_date ASC, t.created_at DESC";

    const [rows] = await pool.query(query, params);

    const tasks = rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      projectName: row.projectName,
      name: row.name,
      description: row.description || '',
      priority: row.priority,
      status: row.status,
      dueDate: row.dueDate,
      createdAt: row.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task by ID (verified against user's project ownership)
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const query = `
      SELECT 
        t.id,
        t.project_id AS projectId,
        p.name AS projectName,
        t.name,
        t.description,
        t.priority,
        t.status,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS dueDate,
        t.created_at AS createdAt
      FROM tasks t
      INNER JOIN projects p ON t.project_id = p.id
      WHERE t.id = ? AND p.user_id = ?
    `;

    const [rows] = await pool.query(query, [taskId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to access it.',
      });
    }

    const row = rows[0];
    const task = {
      id: row.id,
      projectId: row.projectId,
      projectName: row.projectName,
      name: row.name,
      description: row.description || '',
      priority: row.priority,
      status: row.status,
      dueDate: row.dueDate,
      createdAt: row.createdAt,
    };

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task under a user's project
 * POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId, name, description, priority, status, dueDate } = req.body;

    // Verify project exists and belongs to current user
    const [projectRows] = await pool.query(
      'SELECT id, name FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to add tasks to it.',
      });
    }

    const taskPriority = priority || 'MEDIUM';
    const taskStatus = status || 'PENDING';
    const taskDueDate = dueDate || null;

    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, name, description, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, name.trim(), description ? description.trim() : null, taskPriority, taskStatus, taskDueDate]
    );

    const [newRows] = await pool.query(
      `SELECT 
        t.id,
        t.project_id AS projectId,
        p.name AS projectName,
        t.name,
        t.description,
        t.priority,
        t.status,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS dueDate,
        t.created_at AS createdAt
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newRows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task information (including status update / completion)
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { name, description, priority, status, dueDate } = req.body;

    // Check task ownership through project
    const [existing] = await pool.query(
      `SELECT t.* 
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [taskId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to edit it.',
      });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedDescription = description !== undefined ? (description ? description.trim() : null) : current.description;
    const updatedPriority = priority !== undefined ? priority : current.priority;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedDueDate = dueDate !== undefined ? (dueDate || null) : current.due_date;

    await pool.query(
      `UPDATE tasks
       SET name = ?, description = ?, priority = ?, status = ?, due_date = ?
       WHERE id = ?`,
      [updatedName, updatedDescription, updatedPriority, updatedStatus, updatedDueDate, taskId]
    );

    const [updatedRows] = await pool.query(
      `SELECT 
        t.id,
        t.project_id AS projectId,
        p.name AS projectName,
        t.name,
        t.description,
        t.priority,
        t.status,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS dueDate,
        t.created_at AS createdAt
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [taskId]
    );

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedRows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task belonging to user's project
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    // Check ownership
    const [existing] = await pool.query(
      `SELECT t.id 
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND p.user_id = ?`,
      [taskId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.',
      });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
