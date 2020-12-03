'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.run = void 0
const core_1 = require('@actions/core')
const getBranchName = () => process.env.GITHUB_HEAD_REF
const run = async () => {
  const branchName = getBranchName()
  try {
    console.log(branchName)
  } catch (error) {
    core_1.setFailed(error)
  }
}
exports.run = run
if (process.env['NODE_ENV'] !== 'test') {
  exports.run()
}
//# sourceMappingURL=index.js.map
