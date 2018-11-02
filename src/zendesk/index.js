require('dotenv').config()

const getTicketsWithTags = require('./getTicketsWithTags.js')
const generateCSV = require('../utilities/generateCSV.js')

console.time('getTicketsWithTags')
getTicketsWithTags()
  .then(ticketsWithTags => {
    const headers = [ 'timestamp', 'channel', 'title', 'tag', 'url' ]
    const rows = ticketsWithTags.map(ticket => {
      return [
        ticket.created,
        'Zendesk',
        ticket.subject,
        ticket.strippedTags.join(','),
        ticket.htmlUrl
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
