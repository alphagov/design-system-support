const { format } = require('date-fns')

function formatDateForCSV (date) {
  return format(date, 'DD/MM/YYYY HH:mm:ss')
}

module.exports = formatDateForCSV
