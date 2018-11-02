function getTicketsFromView (client, viewId) {
  return new Promise((resolve, reject) => {
    client.views.execute(viewId, {}, (error, statusList, bodyList, responseList, resultList) => {
      if (error) {
        return reject(new Error(`Error getting tickets for view: ${error}`))
      }
      resolve(resultList)
    })
  })
}

module.exports = client => getTicketsFromView.bind(this, client)
