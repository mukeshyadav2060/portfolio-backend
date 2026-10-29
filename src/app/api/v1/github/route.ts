import { getGithubActivity } from "@/lib/github";
import { HttpError, handle, ok } from "@/lib/http";
import { getProfile } from "@/lib/queries";

export const GET = handle(async () => {
  const { githubUsername } = await getProfile();
  if (!githubUsername) throw new HttpError(404, "No GitHub username configured");
  try {
    return ok(await getGithubActivity(githubUsername), { cache: "public", maxAge: 3600 });
  } catch (error) {
    throw new HttpError(502, `GitHub is unavailable: ${(error as Error).message}`);
  }
});
