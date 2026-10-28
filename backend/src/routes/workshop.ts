import { Router, Response } from 'express';
import Workshop from '../models/Workshop';
import { AuthRequest, authenticate, authorize } from '../middleware/auth';
import { workshopSchema } from '../utils/validation';

const router = Router();

// GET /api/workshops — public, get all published workshops
router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const workshops = await Workshop.find({ status: { $in: ['published', 'scheduled'] } })
      .sort({ createdAt: -1 });
    res.json({ workshops });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
});

// GET /api/workshops/:id — public, get single workshop
router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }
    res.json({ workshop });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workshop' });
  }
});

// POST /api/workshops — admin only
router.post(
  '/',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parsed = workshopSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const workshop = new Workshop(parsed.data);
      await workshop.save();
      res.status(201).json({ message: 'Workshop created', workshop });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create workshop' });
    }
  }
);

// PUT /api/workshops/:id — admin only
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parsed = workshopSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const workshop = await Workshop.findByIdAndUpdate(
        req.params.id,
        { $set: parsed.data },
        { new: true, runValidators: true }
      );

      if (!workshop) {
        res.status(404).json({ error: 'Workshop not found' });
        return;
      }

      res.json({ message: 'Workshop updated', workshop });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update workshop' });
    }
  }
);

export default router;
