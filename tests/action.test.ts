import action from "../src/action";
import * as core from "@actions/core";
import { getOctokit } from "@actions/github";

jest.spyOn(core, "debug").mockImplementation(() => {});
jest.spyOn(core, "info").mockImplementation(() => {});
jest.spyOn(console, "info").mockImplementation(() => {});

jest.mock("@actions/github", () => ({
  context: {
    repo: {
      owner: "owner",
      repo: "repo",
    },
  },
  getOctokit: jest.fn(),
}));

const BODY = `### [0.1.2] (2024-09-13)

### Bug Fixes

* small fix ABC-1234 ([8d870d0](https://github.com/DigitalThinkers/get-changelog-action/commit/8d870d05e36683b2648e5a2d112dc28de5435cf5))
* other fix ABC-2345-full-task-name ([8d870d0](https://github.com/DigitalThinkers/get-changelog-action/commit/8d870d05e36683b2648e5a2d112dc28de5435cf5))`;

const BODY_CLICKUP_REPLACED = `### [0.1.2] (2024-09-13)

### Bug Fixes

* small fix <https://app.clickup.com/t/teamId/ABC-1234|ABC-1234> ([8d870d0](https://github.com/DigitalThinkers/get-changelog-action/commit/8d870d05e36683b2648e5a2d112dc28de5435cf5))
* other fix <https://app.clickup.com/t/teamId/ABC-2345|ABC-2345-full-task-name> ([8d870d0](https://github.com/DigitalThinkers/get-changelog-action/commit/8d870d05e36683b2648e5a2d112dc28de5435cf5))`;

const BODY_FULL_PROCESSED = `*[0.1.2] (2024-09-13)*

*Bug Fixes*

•   small fix <https://app.clickup.com/t/teamId/ABC-1234|ABC-1234> (<https://github.com/DigitalThinkers/get-changelog-action/commit/8d870d05e36683b2648e5a2d112dc28de5435cf5|8d870d0>)
•   other fix <https://app.clickup.com/t/teamId/ABC-2345|ABC-2345-full-task-name> (<https://github.com/DigitalThinkers/get-changelog-action/commit/8d870d05e36683b2648e5a2d112dc28de5435cf5|8d870d0>)
`;

const mockOctokit = {
  rest: {
    repos: {
      getReleaseByTag: () => {
        return {
          status: 200,
          data: {
            id: 1,
            url: "url",
            html_url: "html_url",
            body: BODY,
          },
        };
      },
    },
  },
};

const mockSetOutput = jest
  .spyOn(core, "setOutput")
  .mockImplementation(() => {});

const mockInputUnchanged: Record<string, string> = {
  token: "123",
  owner: "owner",
  repo: "repo",
  tag: "v0.0.1",
  convertToMrkdwn: "false",
  replaceClickUpLinks: "false",
  clickUpTeamId: "teamId",
  clickUpCustomPrefix: "ABC",
};

const mockInputClickUpReplaced: Record<string, string> = {
  ...mockInputUnchanged,
  replaceClickUpLinks: "true",
};

const mockInputFullProcessed: Record<string, string> = {
  ...mockInputUnchanged,
  convertToMrkdwn: "true",
  replaceClickUpLinks: "true",
};

describe("get-changelog", () => {
  it("get-changelog-unchanged", async () => {
    jest.spyOn(core, "getInput").mockImplementation((name: string) => {
      return mockInputUnchanged[name] || "";
    });
    jest.spyOn(core, "getBooleanInput").mockImplementation((name: string) => {
      return mockInputUnchanged[name] === "true";
    });

    (getOctokit as jest.Mock).mockReturnValueOnce(mockOctokit);

    await action();

    expect(mockSetOutput).toHaveBeenCalledWith("changelog", BODY);
  });

  it("get-changelog-clickup-replaced", async () => {
    jest.spyOn(core, "getInput").mockImplementation((name: string) => {
      return mockInputClickUpReplaced[name] || "";
    });
    jest.spyOn(core, "getBooleanInput").mockImplementation((name: string) => {
      return mockInputClickUpReplaced[name] === "true";
    });

    (getOctokit as jest.Mock).mockReturnValueOnce(mockOctokit);

    await action();

    expect(mockSetOutput).toHaveBeenCalledWith(
      "changelog",
      BODY_CLICKUP_REPLACED
    );
  });

  it("get-changelog-full-processed", async () => {
    jest.spyOn(core, "getInput").mockImplementation((name: string) => {
      return mockInputFullProcessed[name] || "";
    });
    jest.spyOn(core, "getBooleanInput").mockImplementation((name: string) => {
      return mockInputFullProcessed[name] === "true";
    });

    (getOctokit as jest.Mock).mockReturnValueOnce(mockOctokit);

    await action();

    expect(mockSetOutput).toHaveBeenCalledWith(
      "changelog",
      BODY_FULL_PROCESSED
    );
  });
});
