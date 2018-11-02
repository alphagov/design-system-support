const fs = require('fs')

const csv = require('csv')

function generateCSV ({ filename, headers, rows }) {
  const csvInput = [headers, ...rows]
  return new Promise((resolve, reject) => {
    csv.stringify(csvInput, (err, data) => {
      if (err) {
        return reject(new Error(`Error stringifying CSV input: ${err}`))
      }
      fs.writeFile(`./${filename}.csv`, data, (err) => {
        if (err) {
          return reject(new Error(`Error writing CSV file: ${err}`))
        }
        resolve(`${filename}.csv has been generated`)
      })
    })
  })
}

module.exports = generateCSV
