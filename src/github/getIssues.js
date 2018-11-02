const octokit = require('@octokit/rest')()

octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
})

const { paginateIssues } = require('./paginate.js')(octokit)
const getTeamMembers = require('./getTeamMembers.js')(octokit)
const createQuery = require('./createQuery.js')(octokit)

async function getIssues ({
  repositories,
  excludedLabels,
  labelsToRemove,
  labelMap,
  createdMonthsAgo
}) {
  try {
    const query = createQuery({
      repositories,
      excludedLabels,
      createdMonthsAgo
    })
    const issues = await paginateIssues(octokit.search.issues, { q: query })

    const teamMembers = await getTeamMembers()
    const teamMemberIDs = teamMembers.map(member => member.id)

    // Issues raised by team members should be labelled as `internal`
    // Unless it is an issue this is raised which are labelled with 'user-request'
    const internalLabelledIssues = issues.map(issue => {
      const labels = issue.labels.map(label => label.name)
      const isTeamMember = teamMemberIDs.includes(issue.user.id)
      if (isTeamMember && !labels.includes('user-request')) {
        issue.raisedByTheTeam = true
      }
      return issue
    })

    const formattedIssues = internalLabelledIssues.map(issue => {
      const strippedLabels =
          issue.labels
            .map(label => label.name)
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
      if (issue.raisedByTheTeam) {
        strippedLabels.push('internal')
      }
      return {
        ...issue,
        repository_name: issue.repository_url.replace('https://api.github.com/repos/', ''),
        strippedLabels
      }
    })

    return formattedIssues
  } catch (error) {
    console.error(error)
  }
}

module.exports = getIssues
