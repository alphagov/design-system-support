require('dotenv').config()

const { argv: options } = require('yargs')

const getIssues = require('./getIssues.js')
const generateCSV = require('../utilities/generateCSV.js')
const formatDateForCSV = require('../utilities/formatDateForCSV.js')

const repositories = [
  'alphagov/govuk-frontend',
  'alphagov/govuk-design-system',
  'alphagov/govuk-prototype-kit',
  'alphagov/accessible-autocomplete'
]

const excludedLabels = [
  'greenkeeper',
  'spike',
  'prepare-for-first-timers',
  'first-timers-only',
  'Learn GitHub for content designers'
]

const labelsToRemove = [
  'submitted-by-user',
  'recorded-in-trello',
  'help-wanted',
  'investigation'
]

// Rename certain labels
const labelMap = {
}

// How long to go back
const createdMonthsAgo = typeof options.createdMonthsAgo !== 'undefined' ? options.createdMonthsAgo : 1
console.log(`Looking for issues from ${createdMonthsAgo} month(s) ago`)

console.time('getIssues')
getIssues({
  repositories,
  excludedLabels,
  labelsToRemove,
  labelMap,
  createdMonthsAgo
})
  .then(issues => {
    const headers = [ 'timestamp', 'channel', 'title', 'tag', 'url' ]
    const rows = issues.map(issue => {
      return [
        formatDateForCSV(issue.created_at),
        issue.repository_name,
        issue.title,
        issue.strippedLabels.join(','),
        issue.html_url
      ]
    })

    return generateCSV({ filename: 'github', headers, rows })
  })
  .then(result => {
    console.timeEnd('getIssues')
    console.log(result)
  })
  .catch(error => {
    console.error(error)
  })
