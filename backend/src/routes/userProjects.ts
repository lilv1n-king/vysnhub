import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateProjectCreation, 
  validateProjectUpdate 
} from '../middleware/validationMiddleware';

const router = Router();
const projectController = new ProjectController();

// Alle Routes benötigen Authentifizierung
router.use(authenticateToken);

// GET /api/user-projects - Get all projects (with optional status filter)
router.get('/', projectController.getProjects);

// GET /api/user-projects/stats - Get project statistics
router.get('/stats', projectController.getProjectStats);

// GET /api/user-projects/:id - Get project by ID
router.get('/:id', projectController.getProjectById);

// GET /api/user-projects/:id/order-status - Get project order status
router.get('/:id/order-status', projectController.getProjectOrderStatus);

// POST /api/user-projects - Create new project
router.post('/', validateProjectCreation, projectController.createProject);

// PUT /api/user-projects/:id - Update project
router.put('/:id', validateProjectUpdate, projectController.updateProject);

// DELETE /api/user-projects/:id - Delete project
router.delete('/:id', projectController.deleteProject);

// POST /api/user-projects/:id/duplicate - Duplicate project
router.post('/:id/duplicate', projectController.duplicateProject);

export { router as userProjectsRouter };