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
        ticket.subject.replace('[design-system-support]', ''),
        ticket.strippedTags,
        `https://govuk.zendesk.com/agent/tickets/${ticket.ticket_id}`
      ]
    })

    const csvInput = [csvHeaders, ...csvRows];
    csv.stringify(csvInput, function(err, data){
      console.log(data)
      console.timeEnd('getTicketsWithTags')
    })
  })
  .catch(error => {
    console.error(error)
  })