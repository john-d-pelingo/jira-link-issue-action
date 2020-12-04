import * as core from '@actions/core'
import * as github from '@actions/github'
import { context } from '@actions/github'
import { WebhookPayload } from '@actions/github/lib/interfaces'

import { main } from '..'
const x = 2
describe('index', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }

    context.payload = {
      pull_request: {
        number: 1,
      },
      repository: {
        full_name: 'john-d-pelingo/jira-link-issue-action',
      },
    } as WebhookPayload
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.restoreAllMocks()
  })

  it('logs that the branch name cannot be retrieved when the env variable GITHUB_HEAD_REF is not defined', async () => {
    jest.spyOn(core, 'setFailed')

    await main()

    expect(core.setFailed).toHaveBeenCalledTimes(1)
    expect(core.setFailed).toHaveBeenCalledWith(
      new Error('Unable to retrieve the branch name.'),
    )
  })

  it('logs that the GitHub token cannot be retrieved when the env variable GITHUB_TOKEN or input github-token is not defined', async () => {
    jest.spyOn(core, 'setFailed')
    process.env.GITHUB_HEAD_REF = 'jdp/feat/remove-stuff'

    await main()

    expect(core.setFailed).toHaveBeenCalledTimes(1)
    expect(core.setFailed).toHaveBeenCalledWith(
      new Error('Unable to retrieve the GitHub token.'),
    )
  })

  it('logs that it could not extract the ticket ID and exits', async () => {
    jest.spyOn(core, 'setFailed')
    jest.spyOn(core, 'info')
    process.env.GITHUB_HEAD_REF = 'a-very-nice-branch-name'
    process.env.GITHUB_TOKEN = 'aSeCrEtToKeN'

    await main()

    expect(core.setFailed).toHaveBeenCalledTimes(0)
    expect(core.info).toHaveBeenCalledTimes(1)
    expect(core.info).toHaveBeenCalledWith(
      'Could not extract the ticket id from branch: a-very-nice-branch-name',
    )
  })

  it('logs that the pull request number cannot be retrieved when the pull request object is not defined', async () => {
    jest.spyOn(core, 'setFailed')
    jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
      switch (name) {
        case 'atlassian-domain':
          return 'https://johndpelingo.atlassian.net'
        case 'board-name':
          return 'MEME'
        case 'github-token':
          return 'aSeCrEtToKeN'
        default:
          return ''
      }
    })

    process.env.GITHUB_HEAD_REF = 'MEME-99-testing'
    delete context.payload.pull_request

    await main()

    expect(core.setFailed).toHaveBeenCalledTimes(1)
    expect(core.setFailed).toHaveBeenCalledWith(
      new Error('Unable to retrieve the pull request number.'),
    )
  })

  it('logs that the repository name cannot be retrieved when the repository object is not defined', async () => {
    jest.spyOn(core, 'setFailed')
    jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
      switch (name) {
        case 'atlassian-domain':
          return 'https://johndpelingo.atlassian.net'
        case 'board-name':
          return 'MEME'
        case 'github-token':
          return 'aSeCrEtToKeN'
        default:
          return ''
      }
    })
    process.env.GITHUB_HEAD_REF = 'MEME-99-testing'
    delete context.payload.repository

    await main()

    expect(core.setFailed).toHaveBeenCalledTimes(1)
    expect(core.setFailed).toHaveBeenCalledWith(
      new Error('Unable to retrieve the repository name.'),
    )
  })

  it('creates a comment', async () => {
    jest.spyOn(core, 'setFailed')
    jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
      switch (name) {
        case 'atlassian-domain':
          return 'https://johndpelingo.atlassian.net'
        case 'board-name':
          return 'MEME'
        case 'github-token':
          return 'aSeCrEtToKeN'
        default:
          return ''
      }
    })

    const createCommentSpy = jest.fn()

    // @ts-expect-error too much effort to make types work
    jest.spyOn(github, 'getOctokit').mockImplementation((): {
      issues: {
        createComment: () => void
      }
    } => {
      return {
        issues: {
          createComment: createCommentSpy,
        },
      }
    })

    process.env.GITHUB_HEAD_REF = 'jdp/feat/MEME-9001-upgrade-meme-level'

    await main()

    expect(core.setFailed).toHaveBeenCalledTimes(0)
    expect(github.getOctokit).toHaveBeenCalledTimes(1)
    expect(github.getOctokit).toHaveBeenCalledWith('aSeCrEtToKeN')
    expect(createCommentSpy).toHaveBeenCalledWith({
      body: 'https://johndpelingo.atlassian.net/browse/MEME-9001',
      issue_number: 1,
      owner: 'john-d-pelingo',
      repo: 'jira-link-issue-action',
    })
  })
})
