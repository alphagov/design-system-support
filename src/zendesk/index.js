require('dotenv').config()

const getTicketsWithTags = require('./getTicketsWithTags.js')
const generateCSV = require('../utilities/generateCSV.js')
const formatDateForCSV = require('../utilities/formatDateForCSV.js')

console.time('getTicketsWithTags')
getTicketsWithTags()
  .then(ticketsWithTags => {
    const headers = [ 'timestamp', 'channel', 'title', 'tag', 'url', 'kpi', 'secondary' ]
    const rows = ticketsWithTags.map(ticket => {
      return [
        formatDateForCSV(ticket.created),
        'Zendesk',
        ticket.subject,
        ticket.strippedTags[0],
        ticket.htmlUrl,
        '', // intentionally blank because there's currently no way to determine this via the zendesk API.
        ticket.strippedTags[1]
      ]
    })

    return generateCSV({ filename: 'zendesk', headers, rows })
  })
  .then(result => {
    console.timeEnd('getTicketsWithTags')
    console.log(result)
  })
  .catch(error => {
    console.error(error)
  })
