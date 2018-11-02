const { formatDateYYYYMMDD } = require('./utilities.js')

function createQuery (octokit, {
  repositories,
  excludedLabels,
  createdMonthsAgo
}) {
  const repositoriesParamString = repositories.map(repo => 'repo:' + repo).join(' ')
  const excludedLabelsParamString = excludedLabels.map(repo => '-label:' + repo).join(' ')

  // Get issues created `createdMonthsAgo` month ago
  const date = new Date()
  date.setMonth(date.getMonth() - createdMonthsAgo)
  const createdAtDate = formatDateYYYYMMDD(date)

  // You can prototype a search string using the interface: https://github.com/issues
  return `is:issue ${repositoriesParamString} ${excludedLabelsParamString} created:>${createdAtDate}`
}

module.exports = octokit => createQuery.bind(this, octokit)
