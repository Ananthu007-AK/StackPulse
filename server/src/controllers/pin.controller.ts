import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { z } from 'zod';

const createPinSchema = z.object({
  repoId: z.string().min(1, 'repoId is required'),
  note: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const updatePinSchema = z.object({
  note: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export async function handleGetPins(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const search = (req.query.search as string || '').trim().toLowerCase();
    const tag = (req.query.tag as string || '').trim();

    const pins = await prisma.pin.findMany({
      where: {
        userId,
        ...(tag ? { tags: { has: tag } } : {}),
        ...(search
          ? {
              OR: [
                { note: { contains: search, mode: 'insensitive' } },
                { repository: { name: { contains: search, mode: 'insensitive' } } },
                { repository: { fullName: { contains: search, mode: 'insensitive' } } },
                { repository: { description: { contains: search, mode: 'insensitive' } } }
              ]
            }
          : {})
      },
      include: {
        repository: {
          include: {
            developer: true
          }
        }
      },
      orderBy: { pinnedAt: 'desc' }
    });

    res.json(pins);
  } catch (error) {
    next(error);
  }
}

export async function handleCreatePin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const validated = createPinSchema.parse(req.body);

    // Verify repository exists
    let repo = await prisma.repository.findUnique({
      where: { id: validated.repoId }
    });

    if (!repo) {
      // Check if integer repoId provided as githubRepoId
      const numId = parseInt(validated.repoId, 10);
      if (!isNaN(numId)) {
        repo = await prisma.repository.findUnique({
          where: { githubRepoId: numId }
        });
      }
    }

    if (!repo) {
      throw new ApiError(404, 'Repository not found. Please ensure the developer profile is loaded first.');
    }

    // Check if already pinned
    const existing = await prisma.pin.findUnique({
      where: {
        userId_repoId: {
          userId,
          repoId: repo.id
        }
      }
    });

    if (existing) {
      throw new ApiError(409, 'Repository is already pinned');
    }

    const pin = await prisma.pin.create({
      data: {
        userId,
        repoId: repo.id,
        note: validated.note?.trim() || null,
        tags: validated.tags || []
      },
      include: {
        repository: {
          include: {
            developer: true
          }
        }
      }
    });

    res.status(201).json(pin);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdatePin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const validated = updatePinSchema.parse(req.body);

    const pin = await prisma.pin.findUnique({ where: { id } });
    if (!pin) {
      throw new ApiError(404, 'Pin not found');
    }

    if (pin.userId !== userId) {
      throw new ApiError(403, 'Forbidden: You do not own this pin');
    }

    const updated = await prisma.pin.update({
      where: { id },
      data: {
        ...(validated.note !== undefined ? { note: validated.note.trim() } : {}),
        ...(validated.tags !== undefined ? { tags: validated.tags } : {})
      },
      include: {
        repository: {
          include: {
            developer: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function handleDeletePin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const pin = await prisma.pin.findUnique({ where: { id } });
    if (!pin) {
      throw new ApiError(404, 'Pin not found');
    }

    if (pin.userId !== userId) {
      throw new ApiError(403, 'Forbidden: You do not own this pin');
    }

    await prisma.pin.delete({ where: { id } });

    res.json({ message: 'Pin removed successfully', id });
  } catch (error) {
    next(error);
  }
}
