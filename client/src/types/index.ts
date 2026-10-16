export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface Developer {
  id: string;
  githubUsername: string;
  githubId: number | null;
  avatarUrl: string | null;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  fetchedAt: string;
}

export interface Repository {
  id: string;
  developerId?: string;
  githubRepoId?: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string | null;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  isFork: boolean;
  pushedAt: string | null;
}

export interface DeveloperMetrics {
  totalStars: number;
  totalForks: number;
  languageDistribution: Record<string, number>;
  recentCommits: number;
  weeklyActivity?: { week: string; commits: number }[];
  topRepo: { name: string; stars: number; htmlUrl?: string } | null;
  avgStarsPerRepo: number;
}

export interface DeveloperProfileResponse {
  developer: Developer;
  repositories: Repository[];
  metrics: DeveloperMetrics;
}

export interface Pin {
  id: string;
  userId: string;
  repoId: string;
  note: string | null;
  tags: string[];
  pinnedAt: string;
  repository: Repository & {
    developer?: Developer;
  };
}

export interface ComparisonDeveloperItem {
  id: string;
  comparisonId: string;
  developerId: string;
  order: number;
  developer: Developer;
}

export interface SavedComparison {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  developers: ComparisonDeveloperItem[];
}

export interface ComparisonMetricData {
  developers: DeveloperProfileResponse[];
  winnerHighlights: {
    mostStars: { username: string; count: number };
    mostFollowers: { username: string; count: number };
    mostRepos: { username: string; count: number };
    highestAvgStars: { username: string; count: number };
  };
  combinedLanguages: string[];
}
