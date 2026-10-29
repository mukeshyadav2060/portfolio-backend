import "server-only";
import { env } from "./env";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4; weekday: number };

export type ContributionCalendar = {
  /** "last" for the rolling last year, otherwise the calendar year, e.g. "2025". */
  key: string;
  label: string;
  total: number;
  weeks: Day[][];
};

export type GithubActivity = {
  username: string;
  profileUrl: string;
  avatarUrl: string | null;
  name: string | null;
  publicRepos: number;
  followers: number;
  totalStars: number;
  languages: { name: string; share: number }[];
  topRepos: { name: string; description: string | null; url: string; stars: number; language: string | null; pushedAt: string }[];
  /** Rolling last year first, then each year with contributions, newest first. Empty without GITHUB_TOKEN. */
  calendars: ContributionCalendar[];
  fetchedAt: string;
};

const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: GithubActivity }>();

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "portfolio-backend",
      ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
      ...init?.headers,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`GitHub ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 } as const;
type RawCalendar = {
  totalContributions: number;
  weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: keyof typeof LEVELS; weekday: number }[] }[];
};

const CALENDAR_FIELDS = `contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel weekday}}}`;

function toCalendar(key: string, label: string, raw: RawCalendar): ContributionCalendar {
  return {
    key,
    label,
    total: raw.totalContributions,
    weeks: raw.weeks.map((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0, weekday: d.weekday })),
    ),
  };
}

async function graphql<T>(query: string, variables: Record<string, unknown>) {
  const body = await gh<{ data?: T; errors?: { message: string }[] }>("/graphql", {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  });
  if (body.errors?.length) throw new Error(body.errors[0].message);
  return body.data;
}

/**
 * The rolling last year plus every calendar year with contributions, in two requests:
 * one for the year list, one with an aliased collection per year.
 */
async function calendars(username: string): Promise<ContributionCalendar[]> {
  if (!env.GITHUB_TOKEN) return [];
  type Years = { user?: { contributionsCollection: { contributionYears: number[] } & { contributionCalendar: RawCalendar } } };
  const first = await graphql<Years>(
    `query($login:String!){user(login:$login){contributionsCollection{contributionYears ${CALENDAR_FIELDS}}}}`,
    { login: username },
  );
  const collection = first?.user?.contributionsCollection;
  if (!collection) return [];

  const years = [...collection.contributionYears].sort((a, b) => b - a).slice(0, 6);
  const out = [toCalendar("last", "Last year", collection.contributionCalendar)];
  if (years.length === 0) return out;

  const aliases = years
    .map((y) => `y${y}:contributionsCollection(from:"${y}-01-01T00:00:00Z",to:"${y}-12-31T23:59:59Z"){${CALENDAR_FIELDS}}`)
    .join(" ");
  const perYear = await graphql<{ user?: Record<string, { contributionCalendar: RawCalendar }> }>(
    `query($login:String!){user(login:$login){${aliases}}}`,
    { login: username },
  );
  for (const y of years) {
    const c = perYear?.user?.[`y${y}`];
    if (c) out.push(toCalendar(String(y), String(y), c.contributionCalendar));
  }
  return out;
}

export async function getGithubActivity(username: string): Promise<GithubActivity> {
  const hit = cache.get(username);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  type User = { login: string; html_url: string; avatar_url: string; name: string | null; public_repos: number; followers: number };
  type Repo = { name: string; description: string | null; html_url: string; stargazers_count: number; language: string | null; pushed_at: string; fork: boolean; size: number };

  const [user, repos, cals] = await Promise.all([
    gh<User>(`/users/${encodeURIComponent(username)}`),
    gh<Repo[]>(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`),
    calendars(username).catch((error) => {
      console.warn("[github] contribution calendar unavailable:", (error as Error).message);
      return [];
    }),
  ]);

  const own = repos.filter((r) => !r.fork);
  const bytesByLang = new Map<string, number>();
  for (const r of own) if (r.language) bytesByLang.set(r.language, (bytesByLang.get(r.language) ?? 0) + Math.max(r.size, 1));
  const totalBytes = [...bytesByLang.values()].reduce((a, b) => a + b, 0) || 1;

  const value: GithubActivity = {
    username: user.login,
    profileUrl: user.html_url,
    avatarUrl: user.avatar_url,
    name: user.name,
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    languages: [...bytesByLang]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, bytes]) => ({ name, share: Math.round((bytes / totalBytes) * 1000) / 10 })),
    topRepos: [...own]
      .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.pushed_at) - +new Date(a.pushed_at))
      .slice(0, 4)
      .map((r) => ({ name: r.name, description: r.description, url: r.html_url, stars: r.stargazers_count, language: r.language, pushedAt: r.pushed_at })),
    calendars: cals,
    fetchedAt: new Date().toISOString(),
  };
  cache.set(username, { at: Date.now(), value });
  return value;
}
