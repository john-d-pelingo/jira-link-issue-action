import { setFailed } from '@actions/core'

const getBranchName = (): string => process.env.GITHUB_HEAD_REF as string

export const run = async (): Promise<void> => {
  const branchName = getBranchName()

  try {
    console.log(branchName)
  } catch (error) {
    setFailed(error)
  }
}

if (process.env['NODE_ENV'] !== 'test') {
  run()
}
