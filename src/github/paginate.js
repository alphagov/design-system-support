async function paginate (octokit, method, options) {
  let data = []
  for await (const response of octokit.paginate.iterator(
    method, { ...options, per_page: 100 }
  )) {
    data = data.concat(response.data)
  }
  return data
}

module.exports = octokit => {
  return {
    paginate: paginate.bind(this, octokit)
  }
}
