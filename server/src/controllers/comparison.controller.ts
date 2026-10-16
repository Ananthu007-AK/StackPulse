import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { getDeveloperProfile } from '../services/github.service';
import { computeComparisonMetrics } from '../services/metrics.service';
import { z } from 'zod';

const saveComparisonSchema = z.object({
  name: z.string().min(1, 'Comparison name is required').max(100),
  usernames: z.array(z.string()).min(2, 'At least 2 developers are required').max(5)
});

const updateComparisonSchema = z.object({
  name: z.string().min(1, 'Comparison name is required').max(100)
});

export async function handleGetSavedComparisons(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const comparisons = await prisma.comparison.findMany({
      where: { userId },
      include: {
        developers: {
          include: {
            developer: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comparisons);
  } catch (error) {
    next(error);
  }
}

export async function handleSaveComparison(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const validated = saveComparisonSchema.parse(req.body);

    const devIds: string[] = [];

    // Ensure all developers are present in database
    for (const username of validated.usernames) {
      const lower = username.trim().toLowerCase();
      let dev = await prisma.developer.findUnique({ where: { githubUsername: lower } });
      if (!dev) {
        try {
          const profile = await getDeveloperProfile(username);
          dev = await prisma.developer.findUnique({ where: { id: profile.developer.id } });
        } catch (err: any) {
          console.warn(`Could not resolve developer ${username}: ${err.message}`);
        }
      }
      if (dev && !devIds.includes(dev.id)) {
        devIds.push(dev.id);
      }
    }

    if (devIds.length < 2) {
      throw new ApiError(400, 'Could not resolve at least 2 valid developers to save');
    }

    const comparison = await prisma.comparison.create({
      data: {
        userId,
        name: validated.name.trim(),
        developers: {
          create: devIds.map((devId, index) => ({
            developerId: devId,
            order: index
          }))
        }
      },
      include: {
        developers: {
          include: {
            developer: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json(comparison);
  } catch (error) {
    next(error);
  }
}

export async function handleGetComparisonById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const comparison = await prisma.comparison.findUnique({
      where: { id },
      include: {
        developers: {
          include: {
            developer: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!comparison) {
      throw new ApiError(404, 'Comparison not found');
    }

    if (comparison.userId !== userId) {
      throw new ApiError(403, 'Forbidden: You do not own this comparison');
    }

    // Refresh metrics for each developer
    const profiles = [];
    for (const compDev of comparison.developers) {
      try {
        const profile = await getDeveloperProfile(compDev.developer.githubUsername);
        if (profile && profile.developer) {
          profiles.push(profile);
        }
      } catch (err: any) {
        console.warn(`Could not refresh developer ${compDev.developer.githubUsername}: ${err.message}`);
      }
    }

    const computed = computeComparisonMetrics(profiles);

    res.json({
      comparison,
      computed
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateComparison(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const validated = updateComparisonSchema.parse(req.body);

    const comparison = await prisma.comparison.findUnique({ where: { id } });
    if (!comparison) {
      throw new ApiError(404, 'Comparison not found');
    }

    if (comparison.userId !== userId) {
      throw new ApiError(403, 'Forbidden: You do not own this comparison');
    }

    const updated = await prisma.comparison.update({
      where: { id },
      data: { name: validated.name.trim() },
      include: {
        developers: {
          include: {
            developer: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteComparison(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const comparison = await prisma.comparison.findUnique({ where: { id } });
    if (!comparison) {
      throw new ApiError(404, 'Comparison not found');
    }

    if (comparison.userId !== userId) {
      throw new ApiError(403, 'Forbidden: You do not own this comparison');
    }

    await prisma.comparison.delete({ where: { id } });

    res.json({ message: 'Comparison deleted successfully', id });
  } catch (error) {
    next(error);
  }
}
