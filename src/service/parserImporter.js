import XLSX from 'xlsx';

import OrgUnitTreeMapper from '../util/orgUnitTreeMapper'

const mappingKeys = ['dataElement', 'period', 'orgUnit', 'categoryOptionCombo', 'attributeOptionCombo', 'value', 'storedBy', 'created', 'lastUpdated', 'followUp','variable'];
const eventReqiredKeys = ['program','eventDate','orgUnit'];

const rootOrgUrl = "/organisationUnits?level=1";
const attributesUrl = "/attributes?fields=id,code?paging=false" 
const allOrgsUrl = "/organisationUnits?fields=id,name,attributeValues,path,parent&paging=false";

import AppConfig from '../appConfig';
import AppDataStore from './appDataStore';

const parserRootPath = '../importers/';

class ParserImporter {

  constructor(dataYear, parser, filename, workbook, options, callback) {
    if (!dataYear || !(typeof dataYear === 'number')) {
      throw "dataYear must be a number";
    }
    if (!workbook) {
      throw "workbook is required";
    }
    if (!parser) {
      throw "parser is required";
    }
    this.dataYear = dataYear;
    this.parser = parser;
    this.workbook = workbook;
    this.filename = filename;
    this.options = options;
    this.orgUnits = null;
    this.orgTree = null;
    this.rootOrgId = null;
    this.attributeCodes = {}; 
    this.callback = callback;
  }

  // Report state back via the callback method.
  // State: 'parsing', 'importing', 'complete' 
  reportState(state, progress, importLog) {
    if (this.callback) {
      this.callback(state, progress, importLog);
    }
  }

  // Import the workbook through the parser for the data year
  import() {
    var api = d2.Api.getApi();

    // Load data from the API required to process
    Promise.all([
      api.get(rootOrgUrl),
      api.get(attributesUrl),
      api.get(allOrgsUrl),
    ]).then((results) => {
      this.rootOrgId = results[0].organisationUnits[0].id;
      results[1].attributes.forEach((av) => {
        this.attributeCodes[av.code] = av.id;
      });
      this.orgUnits = results[2].organisationUnits;
      this.orgTree = this.loadOrgTree(this.rootOrgId, this.orgUnits);
      this.importData();
    })
  }

  // Load the required data from the org unit tree for the entire system
  loadOrgTree(rootOrgId, orgUnits) {
    this.orgTree = new OrgUnitTreeMapper(orgUnits, {
      geoconnectAttributeID: this.attributeCodes['geoconnect_id'],
      spellingsAttributeID: this.attributeCodes['alt_spellings'],
      rootOrgId: this.rootOrgId
    }).orgsToTree();
  }

  importData() {
    var parser = this.parser({
      period: this.dataYear,
      orgUnits: this.orgUnits,
      orgTree: this.orgTree
    });
    var api = d2.Api.getApi();

    // Run the parser sheets on the appropriate workbook sheets
    var mappedValues = {};
    for (var i = 0; i < parser.sheets.length; i++) {
      var parserSheet = parser.sheets[i];
      var sheet = findSheetNamed(this.workbook, parserSheet.names);
      var sheetData = parseSheet(parser, parserSheet, sheet);
      if (sheetData.events) {
        if (!mappedValues.events) mappedValues.events = [];
        mappedValues.events = mappedValues.events.concat(sheetData.events);
      } else if (sheetData.dataValues) {
        if (!mappedValues.dataValues) mappedValues.dataValues = [];
        mappedValues.dataValues = mappedValues.dataValues.concat(sheetData.dataValues);
      }
    }

    var postUrl = 'dataValueSets?';
    postUrl += 'dryRun=' + (this.options.dryRun ? 'true': false);

    api.post(postUrl, mappedValues).then((importSummary) => {
      this.saveImportLog(mappedValues, importSummary, this.options.dryRun)
          .then((importLog) => {
        this.reportState('complete', 100, importLog);
      });
    });   
  }

  saveImportLog(payload, importSummary, dryRun) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var api = d2.Api.getApi();
      var appDataStore = new AppDataStore(d2);
      api.get('/system/id').then((ids) => {
        var importLog = {
          id: ids.codes[0],
          payload: payload,
          importSummary: importSummary
        }
        if (dryRun) {
          resolve(importLog);
        } else {
          var url = 'dataStore/' + AppConfig.dataStore.logs + '/' + importLog.id;
          api.post(url, importLog).then((result) => {
            appDataStore.addUpload(self.dataYear, 'temf', self.filename, importLog)
              .then((r) => {resolve(importLog)});
          })
        }
      })
    });
  }

}


// Utility Methods:

function parseSheet(parser, parserSheet, sheet) {
  var data = [];
  var range = /([A-Z]+)([\d]+):([A-Z]+)([\d]+)/.exec(sheet['!ref']);
  if (!range) {
    console.log("Missing sheet information for: " + parserSheet.names);
    return data;
  }
  var lastRow = parseInt(range[4], 10);
  var parserRow = parserSheet.row;

  // Parse Individual Cells
  if (parserSheet.cells) {
    for (var i = 0; i < parserSheet.cells.length; i++) {
      var parserCell = parserSheet.cells[i];
      data = data.concat(parseCellValues(parserCell, sheet));
    }
  }

  // Program Event Mapping
  if (parserRow && parserRow.event) {
    for (var rowNum = parserSheet.startRow; rowNum <= lastRow; rowNum++) {
      var rowData = parseRowDataValues(parserRow, sheet, rowNum);
      var event = parseRowEvent(parserRow.event, rowData);
      event.dataValues = rowData.filter(function(d) {
        return d && d.dataElement && !empty(d.value);
      });
      // Check for required event fields:
      var missingKey = false;
      for (var k = 0; k < eventReqiredKeys.length; k++) {
        if (!event[eventReqiredKeys[k]]) {
          missingKey = eventReqiredKeys[k];
        }
      }
      if (!missingKey && event.dataValues.length > 0) {
        data = data.concat(event);
      }
    }
    return {"events": data}

  // Parse row data values
  } else if (parserRow && parserRow.dataValues) {
    for (var rowNum = parserSheet.startRow; rowNum <= lastRow; rowNum++) {
      var rowData = parseRowDataValues(parser, parserRow, sheet, rowNum);
      data = data.concat(rowData.filter(function(d) {
        return d && d.dataElement && !empty(d.value);
      }));
    }
    return {"dataValues": data}
  } else {
    if (data.length < 1) console.log("No or unknown row config");
    return {"dataValues": data};
  }
}

function parseCellValues(parserCell, sheet) {
  var cellData = sheet[parserCell.column + parserCell.row];
  var data = {};
  // Apply keys in mapping
  for (var i = 0; i < mappingKeys.length; i++) {
    var key = mappingKeys[i];
    if (parserCell[key]) {
      data[key] = valueOrRowFunction(parserCell[key], data)
    }
    // Apply value
    if (parserCell.mapping) {
      data.value = parserCell.mapping(cellData.v, data);
    } else {
      data.value = cellData.v;
    }
  }
  return data;
}

function parseRowDataValues(parser, parserRow, sheet, rowNum) {
  var rowData = [];
  for (var i = 0; i <  parserRow.dataValues.length; i++) {
    var mappingData = parseMapping(parser, parserRow.dataValues[i], 
      parserRow, sheet, rowNum, rowData);
    if (mappingData) rowData.push(mappingData);
  }
  return rowData;
}

function parseRowEvent(parserEvent, rowData) {
  var event = {};
  for (var key in parserEvent) {
    event[key] = valueOrRowFunction(parserEvent[key], rowData)
  }
  return event;
}

function parseMapping(parser, mapping, parserRow, sheet, rowNum, rowData) {
  var cellData = sheet[mapping.column + rowNum];
  if (cellData) {
    return applyRowData(parser, mapping, parserRow, rowData, cellData);
  }
}

function applyRowData(parser, mapping, parserRow, rowData, cellData) {
  var data = {};

  if (!mapping.variable) {
    // Apply defaults
    if (parser.definition && parser.definition.defaults) {
      for (var key in parser.definition.defaults) {
        data[key] = valueOrRowFunction(parser.definition.defaults[key], rowData);
      }
    }

    // Apply invariants
    if (parserRow.invariants) { 
      for (var key in parserRow.invariants) {
        data[key] = valueOrRowFunction(parserRow.invariants[key], rowData)
      }
    }
  }

  // Apply keys in mapping
  for (var i = 0; i < mappingKeys.length; i++) {
    var key = mappingKeys[i];
    if (mapping[key]) {
      data[key] = valueOrRowFunction(mapping[key], rowData)
    }
  }

  // Apply value
  if (mapping.mapping) {
    data.value = mapping.mapping(cellData.v, rowData);
  } else {
    data.value = cellData.v;
  }

  return data;
}

function valueOrRowFunction(val, rowData) {
  if (typeof val === "function") {
    return val(rowData);
  } else {
    return val;
  }
}


function findSheetNamed(workbook, sheetNamesPatterns) {
  for (var i = 0; i < sheetNamesPatterns.length; i++) {
    var patternOrName = sheetNamesPatterns[i];
    for (var s = 0; s < workbook.SheetNames.length; s++) {
      var sheetName = workbook.SheetNames[s]
      if ((patternOrName instanceof RegExp && patternOrName.test(sheetName)) ||
          patternOrName == sheetName) {
        return workbook.Sheets[sheetName];
      }
    }
  }
}

function empty(data) {
  if (typeof(data) == 'number' || typeof(data) == 'boolean') { 
    return false; 
  }
  if( typeof(data) == 'undefined' || data === null) {
    return true; 
  }
  if (typeof(data.length) != 'undefined') {
    return data.length == 0;
  }
  var count = 0;
  for (var i in data) {
    if (data.hasOwnProperty(i)) {
      count ++;
    }
  }
  return count == 0;
}

export default ParserImporter;