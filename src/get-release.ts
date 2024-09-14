import * as github from "@actions/github";

type Release = {
  id: number;
  body?: string | null | undefined;
  url: string;
  html_url: string;
};

export default async function main(
  token: string,
  owner: string,
  repo: string,
  tag: string
): Promise<Release | null> {
  const octokit = github.getOctokit(token);

  const response = await octokit.rest.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to get release for tag ${tag}`);
  } else {
    return {
      id: response.data.id,
      url: response.data.url,
      html_url: response.data.html_url,
      body: response.data.body,
    };
  }
}
