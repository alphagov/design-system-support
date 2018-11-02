const { format } = require('date-fns')

function formatDateForCSV (date) {
  return format(date, 'DD/MM/YYYY HH:MM:SS')
}

module.exports = formatDateForCSV
