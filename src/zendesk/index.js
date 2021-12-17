require('dotenv').config()

const getTicketsWithTags = require('./getTicketsWithTags.js')
const generateCSV = require('../utilities/generateCSV.js')
const formatDateForCSV = require('../utilities/formatDateForCSV.js')

console.time('getTicketsWithTags')
getTicketsWithTags()
  .then(ticketsWithTags => {
    const headers = [ 'timestamp', 'channel', 'title', 'tag', 'url', 'body' ]
    const rows = ticketsWithTags.map(ticket => {
      return [
        formatDateForCSV(ticket.created),
        'Zendesk',
        ticket.subject,
        ticket.strippedTags.join(','),
        ticket.htmlUrl,
        ticket.ticket.description
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
