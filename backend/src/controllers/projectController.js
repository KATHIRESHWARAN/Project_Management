const { pool } = require('../config/db');

/**
 * Get all projects belonging to the authenticated user
 * Supports ?search=... and ?status=...
 * GET /api/projects
 */
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, status } = req.query;

    let query = `
      SELECT 
        p.id,
        p.user_id AS userId,
        p.name,
        p.description,
        p.status,
        DATE_FORMAT(p.start_date, '%Y-%m-%d') AS startDate,
        DATE_FORMAT(p.end_date, '%Y-%m-%d') AS endDate,
        p.created_at AS createdAt,
        COUNT(t.id) AS taskCount,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTaskCount
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.user_id = ?
    `;

    const params = [userId];

    if (search && search.trim()) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (status && ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);

    const projects = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description || '',
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      createdAt: row.createdAt,
      taskCount: Number(row.taskCount || 0),
      completedTaskCount: Number(row.completedTaskCount || 0),
    }));

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single project by ID for authenticated user
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const query = `
      SELECT 
        p.id,
        p.user_id AS userId,
        p.name,
        p.description,
        p.status,
        DATE_FORMAT(p.start_date, '%Y-%m-%d') AS startDate,
        DATE_FORMAT(p.end_date, '%Y-%m-%d') AS endDate,
        p.created_at AS createdAt,
        COUNT(t.id) AS taskCount,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTaskCount
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ? AND p.user_id = ?
      GROUP BY p.id
    `;

    const [rows] = await pool.query(query, [projectId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to access it.',
      });
    }

    const row = rows[0];
    const project = {
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description || '',
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      createdAt: row.createdAt,
      taskCount: Number(row.taskCount || 0),
      completedTaskCount: Number(row.completedTaskCount || 0),
    };

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project for authenticated user
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, status, startDate, endDate } = req.body;

    const projectStatus = status || 'NOT_STARTED';
    const formattedStartDate = startDate || null;
    const formattedEndDate = endDate || null;

    const [result] = await pool.query(
      `INSERT INTO projects (user_id, name, description, status, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), description ? description.trim() : null, projectStatus, formattedStartDate, formattedEndDate]
    );

    const [newRows] = await pool.query(
      `SELECT 
        id,
        user_id AS userId,
        name,
        description,
        status,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS endDate,
        created_at AS createdAt
       FROM projects WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        ...newRows[0],
        taskCount: 0,
        completedTaskCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing project owned by authenticated user
 * PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { name, description, status, startDate, endDate } = req.body;

    // Check project exists and belongs to user
    const [existing] = await pool.query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to edit it.',
      });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedDescription = description !== undefined ? (description ? description.trim() : null) : current.description;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedStartDate = startDate !== undefined ? (startDate || null) : current.start_date;
    const updatedEndDate = endDate !== undefined ? (endDate || null) : current.end_date;

    await pool.query(
      `UPDATE projects 
       SET name = ?, description = ?, status = ?, start_date = ?, end_date = ?
       WHERE id = ? AND user_id = ?`,
      [updatedName, updatedDescription, updatedStatus, updatedStartDate, updatedEndDate, projectId, userId]
    );

    const [updatedRows] = await pool.query(
      `SELECT 
        p.id,
        p.user_id AS userId,
        p.name,
        p.description,
        p.status,
        DATE_FORMAT(p.start_date, '%Y-%m-%d') AS startDate,
        DATE_FORMAT(p.end_date, '%Y-%m-%d') AS endDate,
        p.created_at AS createdAt,
        COUNT(t.id) AS taskCount,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTaskCount
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id
       WHERE p.id = ? AND p.user_id = ?
       GROUP BY p.id`,
      [projectId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        ...updatedRows[0],
        taskCount: Number(updatedRows[0].taskCount || 0),
        completedTaskCount: Number(updatedRows[0].completedTaskCount || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project owned by authenticated user
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Check ownership
    const [existing] = await pool.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it.',
      });
    }

    // Delete project (cascades to tasks)
    await pool.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
