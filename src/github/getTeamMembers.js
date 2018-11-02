// https://github.com/orgs/alphagov/teams/team-gov-uk-design-system
// from running `ockokit.orgs.getTeams`
const GOVUKDesignSystemTeamId = 2397445

async function getTeamMembers (octokit, id = GOVUKDesignSystemTeamId) {
  try {
    const { data, headers, status } = await octokit.orgs.getTeamMembers({ team_id: id })
    return data
  } catch (error) {
    console.error(`getTeamMembers failed: ${error}`)
  }
}

module.exports = getTeamMembers