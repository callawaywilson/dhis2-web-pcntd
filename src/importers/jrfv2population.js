module.exports = function(_params) {

  let params = Object.assign({
    period: null,
    orgUnits: null,
    orgTree: null,
    default: "default",
  }, _params);

  let ParserUtils = require('./parser-utils.js')(params);

  var def = {
    params: params,
    sheets: [
      {
        names: [/COUNTRY_INFO/],
        startRow: 9,
        row: {
          invariants: {
            period: function(row) {return params.period},
            orgUnit: findOrg
          },
          dataValues: [
            {
              column: "B",
              variable: "provincestate",
              orgUnit: null
            },
            {
              column: "C",
              variable: "district",
              orgUnit: null
            },
            // Population - PreSAC
            {
              column: "E",
              dataElement: "pcn-pop",
              categoryOptionCombo: "age-presac",
              mapping: function(value, row) {
                return 0;
              }
            },
            {
              column: "E",
              dataElement: "pcn-pop",
              categoryOptionCombo: "age-presac-sex-unknown",
              mapping: function(value, row) {
                return Math.round(Number.parseFloat(value));
              }
            },
            // Population - SAC
            {
              column: "F",
              dataElement: "pcn-pop",
              categoryOptionCombo: "age-sac",
              mapping: function(value, row) {
                return 0;
              }
            },
            {
              column: "F",
              dataElement: "pcn-pop",
              categoryOptionCombo: "age-sac-sex-unknown",
              mapping: function(value, row) {
                return Math.round(Number.parseFloat(value));
              }
            },
            // Population - Adults
            {
              column: "G",
              dataElement: "pcn-pop",
              categoryOptionCombo: "age-adult",
              mapping: function(value, row) {
                return 0;
              }
            },
            {
              column: "G",
              dataElement: "pcn-pop",
              categoryOptionCombo: "age-adult-sex-unknown",
              mapping: function(value, row) {
                return Math.round(Number.parseFloat(value));
              }
            }
          ]
        }
      }
    ]
  }

  function findOrg(row) {
    // Variables:
    //  - provincestate: RegionZone squished together name
    //  - district: Woreda 
    var variables = ParserUtils.getRowVariables(row);
    if (!variables.provincestate || !variables.district) {
      console.log("Missing district info: " + variables.provincestate + 
        "/" + variables.district);
      return null;
    }
    var org = ParserUtils.districtLookupProvinceState(variables.provincestate, variables.district);
    if (!org) {
      org = ParserUtils.districtLookupState(variables.provincestate, variables.district);
    }

    if (!org) {
      console.log("Unable to find district: " + variables.provincestate + 
        "/" + variables.district);
      return null;
    }
    return org.id;
  }


  return def;
}


