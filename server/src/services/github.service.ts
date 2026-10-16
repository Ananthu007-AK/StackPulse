import axios, { AxiosResponse } from 'axios';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';

const GITHUB_TOKEN = config.githubToken;
const CACHE_FRESH_MS = config.cacheTtlMinutes * 60 * 1000; // 15 minutes
const CACHE_STALE_MS = 6 * 60 * 60 * 1000;                // 6 hours (Stale-While-Revalidate tier)

export const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {})
  },
  timeout: 10000
});

// --- Rate Limit Monitoring & Lockdown ---
let rateLimitRemaining = 5000;
let rateLimitResetEpoch = 0;

function checkRateLimit(response: AxiosResponse) {
  const remainingHeader = response.headers['x-ratelimit-remaining'];
  const resetEpochHeader = response.headers['x-ratelimit-reset'];

  if (remainingHeader !== undefined) {
    rateLimitRemaining = parseInt(remainingHeader, 10);
    rateLimitResetEpoch = parseInt(resetEpochHeader || '0', 10);

    if (rateLimitRemaining < 50) {
      const resetTime = new Date(rateLimitResetEpoch * 1000).toLocaleTimeString();
      console.warn(`⚠️ GitHub rate limit low: ${rateLimitRemaining} remaining, resets at ${resetTime}`);
    }

    if (rateLimitRemaining === 0) {
      throw new ApiError(429, 'GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN in .env or try again later.');
    }
  }
}

function canMakeApiCall(): boolean {
  if (rateLimitRemaining < 10) {
    const resetTime = rateLimitResetEpoch * 1000;
    if (Date.now() < resetTime) {
      return false; // In lockdown mode: only serve from cache
    }
  }
  return true;
}

// --- Fetch All Repos with Pagination ---
async function fetchAllRepos(username: string): Promise<any[]> {
  const allRepos: any[] = [];
  let url: string | null = `/users/${username}/repos?per_page=100&sort=updated`;

  while (url) {
    try {
      const response: AxiosResponse<any> = await github.get(url);
      checkRateLimit(response);
      
      if (Array.isArray(response.data)) {
        allRepos.push(...response.data);
      }

      // Parse Link header for next page
      const linkHeader: string | undefined = response.headers?.link as string | undefined;
      if (linkHeader) {
        const nextMatch: RegExpMatchArray | null = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (nextMatch && nextMatch[1]) {
          // If nextMatch[1] is absolute URL, strip base or use relative path
          const parsed: URL = new URL(nextMatch[1]);
          url = parsed.pathname + parsed.search;
        } else {
          url = null;
        }
      } else {
        url = null;
      }

      // Safety cap: don't fetch more than 500 repos
      if (allRepos.length >= 500) break;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      console.warn(`Error fetching repos page for ${username}: ${err.message}`);
      break;
    }
  }

  return allRepos;
}

// --- Fetch Commit Activity ---
async function fetchCommitActivity(owner: string, repo: string): Promise<any[]> {
  try {
    let response = await github.get(`/repos/${owner}/${repo}/stats/commit_activity`);
    checkRateLimit(response);

    // GitHub returns 202 while computing stats — retry up to 3 times
    let retries = 3;
    while (response.status === 202 && retries > 0) {
      await new Promise(r => setTimeout(r, 1500));
      response = await github.get(`/repos/${owner}/${repo}/stats/commit_activity`);
      retries--;
    }

    return response.status === 200 && Array.isArray(response.data) ? response.data : [];
  } catch {
    return []; // Non-critical, don't fail the whole profile
  }
}

// --- Build Response with Computed Metrics ---
export function buildProfileResponse(
  developer: any,
  repos: any[],
  commitData?: Record<string, any[]>
) {
  const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stars || 0), 0);
  const totalForks = repos.reduce((sum: number, r: any) => sum + (r.forks || 0), 0);

  // Language distribution from primary languages
  const langCounts: Record<string, number> = {};
  repos.forEach((r: any) => {
    if (r.primaryLanguage) {
      langCounts[r.primaryLanguage] = (langCounts[r.primaryLanguage] || 0) + 1;
    }
  });

  const totalLangRepos = Object.values(langCounts).reduce((a, b) => a + b, 0);
  const languageDistribution: Record<string, number> = {};
  if (totalLangRepos > 0) {
    Object.entries(langCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .forEach(([lang, count]) => {
        languageDistribution[lang] = Math.round((count / totalLangRepos) * 100);
      });
  }

  // Recent commits (last 4 weeks from commit_activity)
  let recentCommits = 0;
  const weeklyActivity: { week: string; commits: number }[] = [];

  if (commitData && Object.keys(commitData).length > 0) {
    // Aggregate weekly totals across top repos
    const weekMap: Record<number, number> = {};
    Object.values(commitData).forEach(weeks => {
      if (Array.isArray(weeks)) {
        // Last 12 weeks for activity chart
        const recentWeeks = weeks.slice(-12);
        recentWeeks.forEach((w: any) => {
          if (w && w.week) {
            weekMap[w.week] = (weekMap[w.week] || 0) + (w.total || 0);
          }
        });

        // Last 4 weeks metric
        const last4 = weeks.slice(-4);
        last4.forEach((w: any) => {
          recentCommits += (w.total || 0);
        });
      }
    });

    Object.entries(weekMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([weekTimestamp, total]) => {
        const d = new Date(Number(weekTimestamp) * 1000);
        const label = `${d.getMonth() + 1}/${d.getDate()}`;
        weeklyActivity.push({ week: label, commits: total });
      });
  }

  const sortedByStars = [...repos].sort((a, b) => (b.stars || 0) - (a.stars || 0));

  return {
    developer: {
      id: developer.id,
      githubUsername: developer.githubUsername,
      githubId: developer.githubId,
      avatarUrl: developer.avatarUrl,
      name: developer.name,
      bio: developer.bio,
      company: developer.company,
      location: developer.location,
      blog: developer.blog,
      followers: developer.followers,
      following: developer.following,
      publicRepos: developer.publicRepos,
      fetchedAt: developer.fetchedAt
    },
    repositories: repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.fullName,
      description: r.description,
      htmlUrl: r.htmlUrl,
      stars: r.stars,
      forks: r.forks,
      primaryLanguage: r.primaryLanguage,
      isFork: r.isFork,
      pushedAt: r.pushedAt
    })),
    metrics: {
      totalStars,
      totalForks,
      languageDistribution,
      recentCommits,
      weeklyActivity,
      topRepo: sortedByStars[0]
        ? { name: sortedByStars[0].name, stars: sortedByStars[0].stars, htmlUrl: sortedByStars[0].htmlUrl }
        : null,
      avgStarsPerRepo: repos.length > 0 ? Math.round(totalStars / repos.length) : 0
    }
  };
}

// --- In-Flight Request Deduplication ---
const inFlightRequests = new Map<string, Promise<any>>();

// --- Main: Get or Fetch Developer Profile ---
export async function getDeveloperProfile(username: string) {
  const lowerUsername = username.trim().toLowerCase();
  if (!lowerUsername) {
    throw new ApiError(400, 'GitHub username is required');
  }

  // Bonus: Deduplicate concurrent requests for the same developer handle
  if (inFlightRequests.has(lowerUsername)) {
    const inFlightResult = await inFlightRequests.get(lowerUsername);
    if (inFlightResult) {
      return inFlightResult;
    }
  }

  // Layer 2: Check Database Cache FIRST
  const cached = await prisma.developer.findUnique({
    where: { githubUsername: lowerUsername },
    include: { repositories: { orderBy: { stars: 'desc' } } }
  });

  if (cached) {
    const age = Date.now() - cached.fetchedAt.getTime();

    // Fresh Tier (< 15 mins): Return DB cache instantly, ZERO GitHub calls
    if (age < CACHE_FRESH_MS) {
      return buildProfileResponse(cached, cached.repositories);
    }

    // Layer 4 (SWR) & Layer 6 (Lockdown):
    // Stale Tier (15 mins - 6 hours) OR Low Rate Limit (< 10 remaining):
    // Return DB cache instantly, trigger non-blocking background refresh if quota permits!
    if (age < CACHE_STALE_MS || !canMakeApiCall()) {
      if (canMakeApiCall()) {
        refreshInBackground(lowerUsername, username);
      } else {
        console.warn(`[Lockdown] Rate limit low, serving stale cache for ${lowerUsername}`);
      }
      return buildProfileResponse(cached, cached.repositories);
    }
    console.log(`Cache EXPIRED (> 6h) for ${lowerUsername}, fetching fresh data...`);
  }

  // If rate limit is in lockdown mode and we have any cached data at all, serve it
  if (!canMakeApiCall()) {
    if (cached) {
      return buildProfileResponse(cached, cached.repositories);
    }
    throw new ApiError(429, 'GitHub API rate limit in lockdown. Please configure a GITHUB_TOKEN in .env or try again later.');
  }

  // Expired or not found in cache: fetch synchronously with deduplication
  const promise = (async () => {
    try {
      return await executeFetchAndCache(lowerUsername, username, cached);
    } finally {
      inFlightRequests.delete(lowerUsername);
    }
  })();

  inFlightRequests.set(lowerUsername, promise);
  return promise;
}

// --- Layer 4: Fire-and-Forget Background Revalidation ---
function refreshInBackground(lowerUsername: string, originalUsername: string) {
  if (inFlightRequests.has(lowerUsername)) return;

  const bgPromise = (async () => {
    try {
      console.log(`[SWR] Background revalidating ${lowerUsername}...`);
      const cached = await prisma.developer.findUnique({
        where: { githubUsername: lowerUsername },
        include: { repositories: true }
      });
      const result = await executeFetchAndCache(lowerUsername, originalUsername, cached);
      console.log(`[SWR] Background revalidation completed for ${lowerUsername}`);
      return result;
    } catch (err: any) {
      console.warn(`[SWR] Background refresh failed for ${lowerUsername}: ${err.message}`);
      return null;
    } finally {
      inFlightRequests.delete(lowerUsername);
    }
  })();

  inFlightRequests.set(lowerUsername, bgPromise);
}

async function executeFetchAndCache(lowerUsername: string, originalUsername: string, cachedDev?: any) {
  // Layer 5: Prepare Conditional Request with ETag
  const reqHeaders: Record<string, string> = {};
  if (cachedDev?.etag) {
    reqHeaders['If-None-Match'] = cachedDev.etag;
  }

  // Step 2: Fetch profile from GitHub (handling 304 Not Modified)
  let profileResponse;
  try {
    profileResponse = await github.get(`/users/${lowerUsername}`, {
      headers: reqHeaders,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 304
    });
    checkRateLimit(profileResponse);
  } catch (err: any) {
    if (err.response?.status === 404) {
      throw new ApiError(404, `GitHub user "${originalUsername}" was not found`);
    }
    // If we have stale cache and GitHub rate-limited or failed, serve stale
    if (cachedDev) {
      console.warn(`GitHub request failed, serving stale cache for ${lowerUsername}`);
      return buildProfileResponse(cachedDev, cachedDev.repositories);
    }
    if (err.response?.status === 403 || err.response?.status === 429) {
      throw new ApiError(429, 'GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN in .env or try again later.');
    }
    throw new ApiError(502, `Failed to retrieve data from GitHub: ${err.message}`);
  }

  // Layer 5: 304 Not Modified — Data unchanged! 0 rate limit cost!
  if (profileResponse.status === 304 && cachedDev) {
    console.log(`[ETag 304 Not Modified] ${lowerUsername} unchanged — FREE request!`);
    await prisma.developer.update({
      where: { id: cachedDev.id },
      data: { fetchedAt: new Date() }
    });
    return buildProfileResponse(cachedDev, cachedDev.repositories);
  }

  const profile = profileResponse.data;
  const responseEtag = (profileResponse.headers?.etag as string) || null;

  // Step 3: Fetch repos
  const repos = await fetchAllRepos(lowerUsername);

  // Step 4: Fetch detailed commit activity for top 10 repos
  const topRepos = [...repos]
    .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 10);

  const commitData: Record<string, any[]> = {};
  for (let i = 0; i < topRepos.length; i += 3) {
    const batch = topRepos.slice(i, i + 3);
    const results = await Promise.all(
      batch.map((r: any) => fetchCommitActivity(lowerUsername, r.name))
    );
    batch.forEach((r: any, idx: number) => {
      commitData[r.name] = results[idx];
    });
  }

  // Step 5: Upsert Developer to PostgreSQL safely handling both unique keys (githubUsername & githubId)
  const devData = {
    githubUsername: lowerUsername,
    githubId: profile.id,
    avatarUrl: profile.avatar_url,
    name: profile.name,
    bio: profile.bio,
    company: profile.company,
    location: profile.location,
    blog: profile.blog,
    followers: profile.followers ?? 0,
    following: profile.following ?? 0,
    publicRepos: profile.public_repos ?? repos.length,
    etag: responseEtag,
    fetchedAt: new Date()
  };

  let developer;
  try {
    const existingDev = await prisma.developer.findFirst({
      where: {
        OR: [
          { githubUsername: lowerUsername },
          { githubId: profile.id }
        ]
      }
    });

    if (existingDev) {
      developer = await prisma.developer.update({
        where: { id: existingDev.id },
        data: devData
      });
    } else {
      developer = await prisma.developer.create({
        data: devData
      });
    }
  } catch (err: any) {
    // Graceful fallback if concurrent insert collided
    const fallback = await prisma.developer.findFirst({
      where: {
        OR: [
          { githubUsername: lowerUsername },
          { githubId: profile.id }
        ]
      }
    });
    if (fallback) {
      developer = await prisma.developer.update({
        where: { id: fallback.id },
        data: devData
      });
    } else {
      throw err;
    }
  }

  // Upsert Repositories
  for (const repo of repos) {
    await prisma.repository.upsert({
      where: { githubRepoId: repo.id },
      update: {
        developerId: developer.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        primaryLanguage: repo.language,
        isFork: repo.fork || false,
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
        fetchedAt: new Date()
      },
      create: {
        developerId: developer.id,
        githubRepoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        primaryLanguage: repo.language,
        isFork: repo.fork || false,
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null
      }
    });
  }

  // Fetch updated records with relations
  const fullDeveloper = await prisma.developer.findUnique({
    where: { id: developer.id },
    include: {
      repositories: {
        orderBy: { stars: 'desc' }
      }
    }
  });

  return buildProfileResponse(fullDeveloper!, fullDeveloper!.repositories, commitData);
}
