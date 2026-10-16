import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDeveloperProfile } from '../services/github.service';
import { computeComparisonMetrics } from '../services/metrics.service';
import { ApiError } from '../utils/ApiError';

export async function handleCompare(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { usernames } = req.body;

    if (!Array.isArray(usernames) || usernames.length < 2) {
      throw new ApiError(400, 'Provide at least 2 usernames to compare');
    }
    if (usernames.length > 5) {
      throw new ApiError(400, 'Maximum 5 developers allowed per comparison');
    }

    const uniqueUsernames = Array.from(new Set(usernames.map(u => String(u).trim()).filter(Boolean)));
    if (uniqueUsernames.length < 2) {
      throw new ApiError(400, 'Provide at least 2 distinct developer usernames');
    }

    // Fetch all developer profiles (leveraging database cache if fresh)
    const results: any[] = [];
    const errors: string[] = [];

    for (const username of uniqueUsernames) {
      try {
        const profile = await getDeveloperProfile(username);
        if (profile && profile.developer) {
          results.push(profile);
        } else {
          errors.push(`Could not retrieve profile for @${username}`);
        }
      } catch (err: any) {
        console.warn(`Comparison could not fetch profile for "${username}":`, err.message);
        const cleanMsg = err instanceof ApiError ? err.message : `Failed to retrieve @${username}`;
        errors.push(cleanMsg);
      }
    }

    if (results.length < 2) {
      throw new ApiError(400, `Need at least 2 valid developers to compare. Failed fetches: ${errors.join('; ')}`);
    }

    const comparison = computeComparisonMetrics(results);
    res.json(comparison);
  } catch (error) {
    next(error);
  }
}
