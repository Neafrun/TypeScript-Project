import { useEffect, useMemo, useState } from 'react';
import { getCommits } from '../services/github';
import { analyzeWithAI } from '../services/ai';

export function useRepositoryAnalysis(owner, repo, branch) {
  const [commits, setCommits] = useState([]);
  const [qualityScore, setQualityScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!owner || !repo) return;
    let cancelled = false;
    async function run() {
      try {
        setIsLoading(true);
        setError(null);
        const items = await getCommits(owner, repo, branch);
        if (cancelled) return;
        setCommits(items);
        const ai = await analyzeWithAI(owner, repo, items);
        if (cancelled) return;
        setQualityScore(ai.score);
      } catch (e) {
        setError(e?.message || '분석 실패');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [owner, repo, branch]);

  const commitByHour = useMemo(() => {
    const counts = new Array(24).fill(0);
    for (const c of commits) {
      const date = new Date(c.commit.author.date);
      counts[date.getHours()] += 1;
    }
    return counts.map((count, hour) => ({ hour, count }));
  }, [commits]);

  return { commitByHour, qualityScore, isLoading, error };
}


