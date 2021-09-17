import { getInput, info, setFailed } from '@actions/core'
import { context, getOctokit } from '@actions/github'

const getInputs = (): {
  atlassianDomain: string
  boardName: string
  branchName: string
  githubToken: string
} => {
  const branchName = process.env.GITHUB_HEAD_REF

  if (!branchName) {
    throw new Error('Unable to retrieve the branch name.')
  }

  const githubToken = getInput('github-token') || process.env.GITHUB_TOKEN

  if (!githubToken) {
    throw new Error('Unable to retrieve the GitHub token.')
  }

  return {
    atlassianDomain: getInput('atlassian-domain'),
    boardName: getInput('board-name'),
    branchName,
    githubToken,
  }
}

const getIssueId = ({
  boardName,
  branchName,
}: {
  boardName: string
  branchName: string
}): string | undefined => {
  const regex = new RegExp(`${boardName}-\\d+`, 'gi')

  const result = regex.exec(branchName)

  if (!result) {
    return undefined
  }

  return result[0]
}

const getCommentArguments = ({
  atlassianDomain,
  issueId,
}: {
  atlassianDomain: string
  issueId: string
}): {
  body: string
  issueNumber: number
  owner: string
  repo: string
} => {
  const {
    payload: { pull_request: pullRequest, repository },
  } = context

  const issueNumber = pullRequest?.number

  if (!issueNumber) {
    throw new Error('Unable to retrieve the pull request number.')
  }

  if (!repository || !repository.full_name) {
    throw new Error('Unable to retrieve the repository name.')
  }

  const [owner, repo] = repository.full_name.split('/')

  return {
    body: `JIRA issue: ${atlassianDomain}/browse/${issueId}`,
    issueNumber,
    owner,
    repo,
  }
}

export const main = async (): Promise<void> => {
  try {
    const { atlassianDomain, boardName, branchName, githubToken } = getInputs()
    const issueId = getIssueId({
      boardName,
      branchName,
    })

    if (!issueId) {
      info(`Could not extract the issue ID from branch: ${branchName}`)
      return
    }

    const { body, issueNumber, owner, repo } = getCommentArguments({
      atlassianDomain,
      issueId,
    })

    const octokit = getOctokit(githubToken)

    await octokit.rest.issues.createComment({
      body,
      issue_number: issueNumber,
      owner,
      repo,
    })
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error)
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  void main()
}
