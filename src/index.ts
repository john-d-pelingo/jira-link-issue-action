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

const getTicketId = ({
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

export const run = async (): Promise<void> => {
  try {
    const { atlassianDomain, boardName, branchName, githubToken } = getInputs()
    const ticketId = getTicketId({
      boardName,
      branchName,
    })

    if (!ticketId) {
      info(`Could not extract the ticket id from branch: ${branchName}`)
      return
    }

    const {
      payload: { pull_request: pullRequest, issue, repository },
    } = context

    if (!pullRequest) {
      throw new Error('Unable to retrieve the pull request object.')
    }

    if (!issue) {
      throw new Error('Unable to retrieve the issue object.')
    }

    if (!repository) {
      throw new Error('Unable to retrieve the repository object.')
    }

    if (!repository.full_name) {
      throw new Error('Unable to retrieve the repository name.')
    }

    const octokit = getOctokit(githubToken)
    const [owner, repo] = repository.full_name.split('/')

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issue.number,
      body: `${atlassianDomain}/browse/${ticketId}`,
    })
  } catch (error) {
    setFailed(error)
  }
}

if (process.env['NODE_ENV'] !== 'test') {
  run()
}
