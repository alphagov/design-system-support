const { format } = require('date-fns')

function formatDateYYYYMMDD (date) {
  return format(date, 'YYYY-MM-DD')
}

module.exports = {
  formatDateYYYYMMDD
}
