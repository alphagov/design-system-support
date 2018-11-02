async function paginate (octokit, method, options) {
  let response = await method({ ...options, per_page: 100 })
  let { data } = response
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    data = data.concat(response.data)
  }
  return data
}

async function paginateIssues (octokit, method, options) {
  let response = await method({ ...options, per_page: 100 })
  let data = response.data.items
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    data = data.concat(response.data.items)
  }
  return data
}

module.exports = octokit => {
  return {
    paginate: paginate.bind(this, octokit),
    paginateIssues: paginateIssues.bind(this, octokit)
  }
}
