const { pool } = require('../config/db');

/**
 * Get aggregated dashboard statistics strictly for the authenticated user
 * GET /api/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Total projects count & projects in progress count
    const [projectStats] = await pool.query(
      `SELECT 
        COUNT(id) AS totalProjects,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS projectsInProgress
       FROM projects
       WHERE user_id = ?`,
      [userId]
    );

    // 2. Task counts (total, completed, pending) belonging to user's projects
    const [taskStats] = await pool.query(
      `SELECT 
        COUNT(t.id) AS totalTasks,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks,
        SUM(CASE WHEN t.status = 'PENDING' THEN 1 ELSE 0 END) AS pendingTasks
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ?`,
      [userId]
    );

    // 3. Recent projects (up to 5) for dashboard display
    const [recentProjects] = await pool.query(
      `SELECT 
        p.id,
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
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [userId]
    );

    const totalProjects = Number(projectStats[0]?.totalProjects || 0);
    const projectsInProgress = Number(projectStats[0]?.projectsInProgress || 0);
    const totalTasks = Number(taskStats[0]?.totalTasks || 0);
    const completedTasks = Number(taskStats[0]?.completedTasks || 0);
    const pendingTasks = Number(taskStats[0]?.pendingTasks || 0);

    return res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        projectsInProgress,
        recentProjects: recentProjects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          createdAt: p.createdAt,
          taskCount: Number(p.taskCount || 0),
          completedTaskCount: Number(p.completedTaskCount || 0),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
