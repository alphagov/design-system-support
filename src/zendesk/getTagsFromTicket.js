const fetch = require('node-fetch')
const Headers = fetch.Headers

const { ZENDESK_USERNAME, ZENDESK_PASSWORD } = process.env

if (!ZENDESK_USERNAME || !ZENDESK_PASSWORD) {
  throw new Error('No credentials are set for Zendesk, see README')
}

// Not all endpoints are in the zendesk API, but to avoid having to reimplement pagination (for now)
// I'm using both the client and custom endpoints
function request (paths) {
  const btoa = string => Buffer.from(string).toString('base64')
  return fetch(`https://govuk.zendesk.com/api/v2/${paths.join('/')}.json`, {
    headers: new Headers({
      'Authorization': 'Basic ' + btoa(ZENDESK_USERNAME + ':' + ZENDESK_PASSWORD),
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  })
}

async function getTagsFromTicket (ticketId) {
  try {
    const body = await request(['tickets', ticketId, 'tags'])
    if (body.status === 404) {
      return []
    }
    const { tags } = await body.json()
    return tags
  } catch (error) {
    console.error(`Error getting tags for for ticket ${ticketId}: `, error)
  }
}

module.exports = getTagsFromTicket
