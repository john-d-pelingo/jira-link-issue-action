# jira-link-issue-action [![MIT License][shield-license]][license] [![codecov][shield-codecov]][codecov]

[GitHub action](https://github.com/features/actions) for linking
[JIRA](https://www.atlassian.com/software/jira) issues as a comment.

## Usage

```yaml
name: Try GitHub Action

on:
  pull_request:
    types: [opened]

jobs:
  link-jira-issue:
    name: Link Jira Issue
    runs-on: ubuntu-latest
    steps:
      - name: Link Jira Issue
        uses: john-d-pelingo/jira-link-issue-action@v1
        with:
          atlassian-domain: 'https://johndpelingo.atlassian.net'
          board-name: 'MEME'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Name               | Type   | Required? | Description                      |
| ------------------ | ------ | --------- | -------------------------------- |
| `atlassian-domain` | string | yes       | The domain of your Atlassian app |
| `board-name`       | string | yes       | The JIRA board name              |
| `github-token`     | string | yes       | The GitHub token for API access  |

## Notes

- This action works with pull requests only as it requires the branch name to
  determine the issue ID.

## License

[MIT][license] &copy; [John Darryl Pelingo][me]

[codecov]: https://codecov.io/gh/john-d-pelingo/jira-link-issue-action
[license]: LICENSE
[me]: https://johndpelingo.com/
[shield-codecov]:
  https://codecov.io/gh/john-d-pelingo/jira-link-issue-action/branch/master/graph/badge.svg?token=VNPWLKP8MG
[shield-license]: https://img.shields.io/badge/License-MIT-lavender.svg
