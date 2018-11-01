const { promisify } = require('util')
  
require('dotenv').config()

const fetch = require('node-fetch')
const Headers = fetch.Headers
const zendesk = require('node-zendesk')
const RateLimiter = require('limiter').RateLimiter

// The design-system-pipline@digital.cabinet-office.gov.uk account has a view setup
// which we can use to get all the tickets relevant for the GOV.UK Design System.
const DESIGN_SYSTEM_VIEW = 360001206339

// https://developer.zendesk.com/rest_api/docs/core/introduction#rate-limits
const limiter = new RateLimiter(700, 'minute')  // Assume 'Enterprise' plan to start with

const { ZENDESK_USERNAME, ZENDESK_PASSWORD } = process.env

const client = zendesk.createClient({
  username: ZENDESK_USERNAME,
  password: ZENDESK_PASSWORD,
  remoteUri: 'https://govuk.zendesk.com/api/v2',
  disableGlobalState: true, // https://github.com/blakmatrix/node-zendesk#disable-default-scripting-functionality--enable-library-only
  debug: false
})

// Not all endpoints are in the zendesk API, but to avoid having to reimplement pagination (for now)
// I'm using both the client and custom endpoints
function request (paths) {
  const btoa = string => Buffer.from(string).toString('base64')
  return fetch(`https://govuk.zendesk.com/api/v2/${paths.join('/')}.json`, { 
    headers: new Headers({
      'Authorization': 'Basic '+btoa(ZENDESK_USERNAME + ':' + ZENDESK_PASSWORD), 
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  })
}

function getTicketsWithTags () {
  return new Promise((resolve, reject) => {
    limiter.removeTokens(1, function(error, remainingRequests) {
      if (error) {
        return console.error(error)
      }
      client.views.execute(DESIGN_SYSTEM_VIEW, {}, (error, statusList, bodyList, responseList, resultList) => {
        if (error) {
          return console.error('Error getting tickets for view: ', error)
        }
      
        const allTickets = 
          resultList
            .map(result => result.rows)
            .reduce((a, b) => {
              return a.concat(b)
            }, [])
    
        // const tickets = [allTickets[0], allTickets[1], allTickets[2]]
        const tickets = allTickets
    
        const ticketsWithTagsPromises = tickets.map(ticket => {
          return new Promise((resolve, reject) => {
            limiter.removeTokens(1, function(error, remainingRequests) {
              if (error) {
                console.error(error)
                return reject(error)
              }
              const id = ticket.ticket_id
              console.log('Getting tags for ticket', id)
              request(['tickets', id, 'tags'])
                .then(body => {
                  if (body.status === 404) {
                    console.log(`Ticket (${id}) found to get tags`)
                    return { tags: [] }
                  }
                  return body.json()
                })
                .then(json => {
                  const { tags } = json
                  // We only want tags with the correct prefix
                  const tagsWithPrefix = tags.filter(tag => tag.startsWith('design-system'))
                  // However we can remove the prefix for use in analysis
                  const strippedTags = tagsWithPrefix.map(tag => tag.replace('design-system-', ''))
                  resolve({
                    ...ticket,
                    tags,
                    strippedTags
                  })
                })
                .catch(error => {
                  console.error(`Error getting tags for for ticket ${id}: `, error)
                  reject(error)
                })
            })
          })
        })
    
        Promise
          .all(ticketsWithTagsPromises)
          .then(resolve)
          .catch(reject)
      })
    })
  })
}

console.time('getTicketsWithTags')
getTicketsWithTags()
  .then(ticketsWithTags => {
    console.timeEnd('getTicketsWithTags')
    console.log(ticketsWithTags)
    console.log(ticketsWithTags.length)
  })
  .catch(error => {
    console.error(error)
  })