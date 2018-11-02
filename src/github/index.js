const fs = require('fs')

const csv = require('csv')

const getIssues = require('./getIssues.js')

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
  'first-timers-only',
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
    const csvHeaders = [ 'timestamp', 'channel', 'title', 'tag', 'url' ]

    const csvRows = issues.map(issue => {
      return [
        issue.timestamp,
        issue.repository_name,
        issue.title,
        issue.labels.join(','),
        issue.url
      ]
    })

    const csvInput = [csvHeaders, ...csvRows];
    csv.stringify(csvInput, (err, data) => {
      if (err) {
        return console.error(`Error stringifying CSV input: ${err}`)
      }
      fs.writeFile('./github.csv', data, (err) => {
        if (err) {
          return console.error(`Error writing CSV file: ${err}`)
        }
        console.log('github.csv has been generated');
        console.timeEnd('getIssues')
      });
    })
  })
  .catch(error => {
    console.error(error)
  })