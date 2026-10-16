import { Request, Response, NextFunction } from 'express';
import { getDeveloperProfile } from '../services/github.service';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export async function handleGetDeveloperProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    if (!username) {
      throw new ApiError(400, 'Username parameter is required');
    }
    const profile = await getDeveloperProfile(username);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function handleGetDeveloperRepos(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '10', 10)));
    const search = (req.query.search as string || '').trim().toLowerCase();
    const language = (req.query.language as string || '').trim();
    const sortBy = (req.query.sort as string || 'stars'); // stars | forks | name | pushed
    const order = (req.query.order as string || 'desc') === 'asc' ? 'asc' : 'desc';

    const lowerUsername = username.toLowerCase();
    const developer = await prisma.developer.findUnique({
      where: { githubUsername: lowerUsername }
    });

    if (!developer) {
      // Fetch fresh first
      await getDeveloperProfile(username);
    }

    const dev = await prisma.developer.findUnique({
      where: { githubUsername: lowerUsername }
    });

    if (!dev) {
      throw new ApiError(404, 'Developer not found');
    }

    const where: any = {
      developerId: dev.id
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (language) {
      where.primaryLanguage = { equals: language, mode: 'insensitive' };
    }

    const orderBy: any = {};
    if (sortBy === 'forks') orderBy.forks = order;
    else if (sortBy === 'name') orderBy.name = order;
    else if (sortBy === 'pushed') orderBy.pushedAt = order;
    else orderBy.stars = order;

    const [total, repositories] = await Promise.all([
      prisma.repository.count({ where }),
      prisma.repository.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    res.json({
      repositories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}
