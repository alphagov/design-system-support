/* eslint-env jest */

const formatDateForCSV = require('./formatDateForCSV')

test('formatDateForCSV', () => {
  const datetime = new Date('2022-02-02T14:40:53.099Z')
  expect(formatDateForCSV(datetime)).toBe('02/02/2022 14:40:53')
})
