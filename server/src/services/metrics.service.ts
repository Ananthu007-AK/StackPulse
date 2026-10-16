export interface ComparisonResult {
  developers: any[];
  winnerHighlights: {
    mostStars: { username: string; count: number };
    mostFollowers: { username: string; count: number };
    mostRepos: { username: string; count: number };
    highestAvgStars: { username: string; count: number };
  };
  combinedLanguages: string[];
}

export function computeComparisonMetrics(devProfiles: any[]): ComparisonResult {
  let maxStars = { username: '', count: -1 };
  let maxFollowers = { username: '', count: -1 };
  let maxRepos = { username: '', count: -1 };
  let maxAvgStars = { username: '', count: -1 };

  const languageSet = new Set<string>();
  const validProfiles = (devProfiles || []).filter(dev => dev && dev.developer);

  validProfiles.forEach(dev => {
    const username = dev.developer?.githubUsername || 'Unknown';
    const stars = dev.metrics?.totalStars || 0;
    const followers = dev.developer?.followers || 0;
    const repos = dev.developer?.publicRepos || dev.repositories?.length || 0;
    const avgStars = dev.metrics?.avgStarsPerRepo || 0;

    if (stars > maxStars.count) maxStars = { username, count: stars };
    if (followers > maxFollowers.count) maxFollowers = { username, count: followers };
    if (repos > maxRepos.count) maxRepos = { username, count: repos };
    if (avgStars > maxAvgStars.count) maxAvgStars = { username, count: avgStars };

    if (dev.metrics?.languageDistribution) {
      Object.keys(dev.metrics.languageDistribution).forEach(lang => languageSet.add(lang));
    }
  });

  return {
    developers: validProfiles,
    winnerHighlights: {
      mostStars: maxStars,
      mostFollowers: maxFollowers,
      mostRepos: maxRepos,
      highestAvgStars: maxAvgStars
    },
    combinedLanguages: Array.from(languageSet)
  };
}
