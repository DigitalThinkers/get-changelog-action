import * as core from "@actions/core";
import getRelease from "./get-release";
import slackify from "slackify-markdown";

export default async function main() {
  const token = core.getInput("token");
  const owner = core.getInput("owner");
  const repo = core.getInput("repo");
  const tag = core.getInput("tag");

  const release = await getRelease(token, owner, repo, tag);

  if (release === null) {
    throw new Error("Failed to get release");
  }

  core.info(`Got release: ${release.html_url}`);
  core.info(`Original body: ${release.body}`);

  let changelog = release.body || "";

  const convertToMrkdwn = core.getBooleanInput("convertToMrkdwn");
  if (changelog && convertToMrkdwn) {
    changelog = slackify(release.body || "");
  }

  const replaceClickUpLinks = core.getBooleanInput("replaceClickUpLinks");
  if (changelog && replaceClickUpLinks) {
    const clickUpTeamId = core.getInput("clickUpTeamId");
    const clickUpCustomPrefix = core.getInput("clickUpCustomPrefix");
    const regex = new RegExp(
      `${clickUpCustomPrefix}-([0-9]+)([0-9a-zA-Z\-_]*)`,
      "g"
    );

    changelog = changelog.replaceAll(regex, (m, g1) => {
      const clickUpId = `${clickUpCustomPrefix}-${g1}`;
      return `<https://app.clickup.com/t/${clickUpTeamId}/${clickUpId}|${m}>`;
    });
  }

  core.setOutput("changelog", changelog);
}
