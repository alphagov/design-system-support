// https://github.com/orgs/alphagov/teams/team-gov-uk-design-system
const GOVUKDesignSystemOrg = 'alphagov'
const GOVUKDesignSystemTeamSlug = 'team-gov-uk-design-system'

async function getTeamMembers (octokit) {
  const { data } = await octokit.teams.listMembersInOrg(
    { org: GOVUKDesignSystemOrg, team_slug: GOVUKDesignSystemTeamSlug }
  )
  return data
}

module.exports = octokit => getTeamMembers.bind(this, octokit)
