// const XlsxPopulate = require('./xlsx-populate');

class Exporter {

  downloadWorkbook(workbook, filename, callback) {
    workbook.outputAsync()
    .then(function (blob) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // If IE, you must uses a different method.
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        if (callback) {
          callback();
        }
    });
  }

  downloadTemf(year, data, callback) {
    var self = this;
    XlsxPopulate.fromBlankAsync()
      .then(workbook => {
          // Modify the workbook.
          self.addData(workbook, data.temf, '4-TEMF');
          self.addData(workbook, data.zithromaxApp, '5-Zithromax App');
          workbook.deleteSheet("Sheet1");
          self.downloadWorkbook(workbook, year+'-Temf-Application.xlsx', callback);
      });
  }

  addData(workbook, data, name) {
    var sheet = workbook.addSheet(name);
    var row = 1;
    for (var c = 0; c < data.headers.length; c++) {
      sheet.row(row).cell(c+1).value(data.headers[c].name);
    }
    sheet.cell('A2').value(data.rows);
  }


} 

export default Exporter;