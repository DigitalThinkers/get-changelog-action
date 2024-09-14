const CLICKUP_URL = "https://app.clickup.com";

export default async function main(
  changelog: string,
  clickUpTeamId: string,
  clickUpCustomPrefix: string
): Promise<string> {
  const regex = new RegExp(
    `${clickUpCustomPrefix}-([0-9]+)([0-9a-zA-Z\-_]*)`,
    "g"
  );

  changelog = changelog.replaceAll(regex, (m, g1) => {
    const clickUpId = `${clickUpCustomPrefix}-${g1}`;
    return `<${CLICKUP_URL}/t/${clickUpTeamId}/${clickUpId}|${m}>`;
  });

  return changelog;
}
