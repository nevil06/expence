import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getExpenses, 
  getExpense, 
  createExpense, 
  updateExpense, 
  deleteExpense 
} from '../controllers/expenseController';

const router = Router();

router.get('/', authenticateToken, getExpenses);
router.get('/:id', authenticateToken, getExpense);
router.post('/', authenticateToken, createExpense);
router.put('/:id', authenticateToken, updateExpense);
router.delete('/:id', authenticateToken, deleteExpense);

export const expenseRoutes = router;