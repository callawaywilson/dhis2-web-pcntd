const temf2016_2018 = require('./importers/temf2016');
const temf2015 = require('./importers/temf2015');
const epirf2015 = require('./importers/epirf2015.js');
const epirf2017 = require('./importers/epirf2017.js');
const jrfV2 = require('./importers/jrf-v2.js')
const jrfV2Demographics = require('./importers/jrf-v2-demographics.js')


export default {

  // Namespaces of Data Store data:
  dataStore: {
    data: 'dhis2-web-pcntd',
    logs: 'dhis2-web-pcntd-logs'
  },

  // Years that importers are available
  temfYears: [2015, 2016, 2017, 2018],

  // List of parsers to use for years & workbooks (for importing)
  // parser types:
  //  temf - TEMF / Zithromax application
  //  jrsm - Joint request for select medicine
  //  jrf - Joint reporting form
  //  epirf - Epi reporting form
  parsers: {
    '2015': {
      'temf': temf2015,
      'epirf': epirf2015,
      'jrf': [jrfV2, jrfV2Demographics]
    },
    '2016': {
      'temf': temf2016_2018,
      'epirf': epirf2015,
      'jrf': [jrfV2, jrfV2Demographics]
    },
    '2017': {
      'temf': temf2016_2018,
      'epirf': epirf2017,
      'jrf': [jrfV2, jrfV2Demographics]
    },
    '2018': {
      'temf': temf2016_2018,
      'epirf': epirf2017,
      'jrf': [jrfV2, jrfV2Demographics]
    }
  }
};