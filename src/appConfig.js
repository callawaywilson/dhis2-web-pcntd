const temf2016_2018 = require('./importers/temf2016')

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
      'temf': require('./importers/temf2015')
    },
    '2016': {
      'temf': temf2016_2018
    },
    '2017': {
      'temf': temf2016_2018
    },
    '2018': {
      'temf': temf2016_2018
    }
  }
};