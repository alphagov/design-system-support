require('dotenv').config()

const csv = require('csv')
const octokit = require('@octokit/rest')()

octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
})

async function paginate (method, options) {
  let response = await method({ ...options, per_page: 100 })
  let { data } = response
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    data = data.concat(response.data)
  }
  return data
}


async function paginateIssues (method, options) {
  let response = await method({ ...options, per_page: 100 })
  let data = response.data.items
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    data = data.concat(response.data.items)
  }
  return data
}

function formatDateYYYYMMDD (date) {
  return [
    date.getFullYear(),
    ('0' + (date.getMonth() + 1)).slice(-2),
    ('0' + date.getDate()).slice(-2)
  ].join('-')
}

async function getIssues () {
    
  try {
    
    // const issuesAndPullRequests = await paginate(octokit.issues.getForRepo, {
    //   owner: 'alphagov',
    //   repo: 'govuk-frontend',
    //   state: 'all'
    // })
  
    // The Github API classes issues and pull requests as the same thing,
    // we only want issues raised.
    // const issues = issuesAndPullRequests.filter(item => !item.pull_request)
    
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
    
    const labelMap = {
    }
    
    const repositoriesParamString = repositories.map(repo => 'repo:' + repo).join(' ')
    const excludedLabelsParamString = excludedLabels.map(repo => '-label:' + repo).join(' ')
    
    
    // Get issues created 1 month ago
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    const createdAtDate = formatDateYYYYMMDD(date);
    
    const baseQuery = `is:issue ${repositoriesParamString} ${excludedLabelsParamString} created:>${createdAtDate}`
    console.log('base query', baseQuery)

    // You can prototype a search string using the interface: https://github.com/issues
    const openIssues = await paginateIssues(octokit.search.issues, {
      q: `is:open ${baseQuery}`
    })
    // You can't have both open and closed issue from the API as far as I can tell.
    const closedIssues = await paginateIssues(octokit.search.issues, {
      q: `is:closed ${baseQuery}`
    })
    const issues = openIssues.concat(closedIssues)
    
    // We want issues that are only raised by our users,
    // any issues that are raised by us on behalf or our users will be tagged with 'user-request'
    const userRaisedIssues = issues.filter(issue => {
      const labels = issue.labels.map(label => label.name)
      if (issue.author_association === 'MEMBER' && !labels.includes('user-request')) {
        return false
      }
      return true
    })
  
    // We want to keep non-user raised issues but label them internal
    // const userRaisedIssues = issues.map(issue => {
    //   const labels = issue.labels.map(label => label.name)
    //   if (issue.author_association === 'MEMBER' && !labels.includes('user-request')) {
    //     issue.labels.push({ name: 'internal' })
    //   }
    //   console.log(issue.labels)
    //   return issue
    // })
    
    const formattedIssues = userRaisedIssues.map(issue => {
      return {
        repository_name: issue.repository_url.replace('https://api.github.com/repos/', ''),
        timestamp: issue.created_at,
        url: issue.html_url,
        title: issue.title,
        labels: issue.labels.map(label => label.name)
                 // Some labels we dont need in the output
                 .filter(label => {
                   return !labelsToRemove.includes(label)
                 })
                // Other labels need to have their name changed to match the internal taxonomy
                 .map(label => {
                   if (labelMap[label]) {
                     return labelMap[label] 
                   }
                   return label
                 })
      }
    }) 
    
    console.log(`Total user raised issues : ${formattedIssues.length}`)
    
    return formattedIssues
  } catch(error) {
    console.error(error)
  }
}

module.exports = getIssues