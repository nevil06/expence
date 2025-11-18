import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';

const router = Router();

router.get('/', authenticateToken, getCategories);
router.get('/:id', authenticateToken, getCategory);
router.post('/', authenticateToken, createCategory);
router.put('/:id', authenticateToken, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export const categoryRoutes = router;