const fs = require('fs')

const csv = require('csv')

const getTicketsWithTags = require('./getTicketsWithTags.js')

console.time('getTicketsWithTags')
getTicketsWithTags()
  .then(ticketsWithTags => {
    const csvHeaders = [ 'timestamp', 'channel', 'title', 'tag', 'url' ]

    const csvRows = ticketsWithTags.map(ticket => {
      return [
        ticket.created,
        'Zendesk',
        ticket.subject.replace('[design-system-support]', '').trim(),
        ticket.strippedTags.join(','),
        `https://govuk.zendesk.com/agent/tickets/${ticket.ticket_id}`
      ]
    })

    const csvInput = [csvHeaders, ...csvRows];
    csv.stringify(csvInput, (err, data) => {
      if (err) {
        return console.error(`Error stringifying CSV input: ${err}`)
      }
      fs.writeFile('./zendesk.csv', data, (err) => {
        if (err) {
          return console.error(`Error writing CSV file: ${err}`)
        }
        console.log('tickets.csv has been generated');
        console.timeEnd('getTicketsWithTags')
      });
    })
  })
  .catch(error => {
    console.error(error)
  })