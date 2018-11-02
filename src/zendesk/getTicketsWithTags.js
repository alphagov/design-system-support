const zendesk = require('node-zendesk')

// The design-system-pipline@digital.cabinet-office.gov.uk account has a view setup
// which we can use to get all the tickets relevant for the GOV.UK Design System.
const DESIGN_SYSTEM_VIEW = 360001206339

const { ZENDESK_USERNAME, ZENDESK_PASSWORD } = process.env

if (!ZENDESK_USERNAME || !ZENDESK_PASSWORD) {
  throw new Error('No credentials are set for Zendesk, see README section "Adding credentials"')
}

const client = zendesk.createClient({
  username: ZENDESK_USERNAME,
  password: ZENDESK_PASSWORD,
  remoteUri: 'https://govuk.zendesk.com/api/v2',
  disableGlobalState: true, // https://github.com/blakmatrix/node-zendesk#disable-default-scripting-functionality--enable-library-only
  debug: false
})

const getTicketsFromView = require('./getTicketsFromView.js')(client)
const getTagsFromTicket = require('./getTagsFromTicket.js')

function getTicketsWithTags () {
  return new Promise(async (resolve, reject) => {
    try {
      const results = await getTicketsFromView(DESIGN_SYSTEM_VIEW)

      const allTickets =
          results
            .map(result => result.rows)
            // Flatten array
            .reduce((a, b) => {
              return a.concat(b)
            }, [])

      const tickets = allTickets

      const ticketsWithTagsPromises = tickets.map(async (ticket) => {
        const tags = await getTagsFromTicket(ticket.ticket_id)
        // We only want tags with the correct prefix
        const tagsWithPrefix = tags.filter(tag => tag.startsWith('design-system'))
        // However we can remove the prefix for use in analysis
        const strippedTags = tagsWithPrefix.map(tag => tag.replace('design-system-', ''))

        // Remove noisey subject tag
        ticket.subject = ticket.subject.replace('[design-system-support]', '').trim()

        // Construct a URL so it's easy to visit the ticket
        ticket.htmlUrl = `https://govuk.zendesk.com/agent/tickets/${ticket.ticket_id}`

        return {
          ...ticket,
          tags,
          strippedTags
        }
      })

      Promise
        .all(ticketsWithTagsPromises)
        .then(resolve)
        .catch(reject)
    } catch (error) {
      console.error(error)
    }
  })
}

module.exports = getTicketsWithTags
