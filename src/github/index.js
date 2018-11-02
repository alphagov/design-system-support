require('dotenv').config()

const getIssues = require('./getIssues.js')
const generateCSV = require('../utilities/generateCSV.js')

const repositories = [
  'alphagov/govuk-frontend',
  'alphagov/govuk-design-system',
  'alphagov/govuk-prototype-kit',
  'alphagov/accessible-autpcomplete'
]

const excludedLabels = [
  'greenkeeper',
  'spike',
  'prepare-for-first-timers',
  'first-timers-only'
]

const labelsToRemove = [
  'user-request',
  'recorded-in-trello',
  'help-wanted',
  'investigation'
]

// Rename certain labels
const labelMap = {
}

// How long to go back
const createdMonthsAgo = 1

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
        issue.timestamp,
        issue.repository_name,
        issue.title,
        issue.labels.join(','),
        issue.url
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
