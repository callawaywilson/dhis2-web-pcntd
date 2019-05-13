const temf2016 = require('./importers/temf2016');
const temf2015 = require('./importers/temf2015');
const epirf2015 = require('./importers/epirf2015.js');
const epirfv5 = require('./importers/epirfv5.js');
const jrfv2 = require('./importers/jrfv2.js')
const jrfv2demographics = require('./importers/jrfv2demographics.js')


export default {

  // Namespaces of Data Store data:
  dataStore: {
    data: 'dhis2-web-pcntd',
    logs: 'dhis2-web-pcntd-logs'
  },

  // Years that importers are available
  importYears: {
    temf: [2015, 2016, 2017, 2018],
    epirf: [2015, 2016, 2017, 2018],
    jrf: [2015, 2016, 2017, 2018]
  },

  // Download data years
  downloadYears: [2015, 2016, 2017, 2018, 2019],

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
      'jrf': [jrfv2, jrfv2demographics]
    },
    '2016': {
      'temf': temf2016,
      'epirf': epirf2015,
      'jrf': [jrfv2, jrfv2demographics]
    },
    '2017': {
      'temf': temf2016,
      'epirf': epirfv5,
      'jrf': [jrfv2, jrfv2demographics]
    },
    '2018': {
      'temf': temf2016,
      'epirf': epirfv5,
      'jrf': [jrfv2, jrfv2demographics]
    }
  },

  exportViews: {
    '2018': {
      'temf': [
        'temf-query-2018',
        'zithromax-app-query-2018'
      ]
    }
  }
};