import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

// Material UI
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Button from 'd2-ui/lib/button/Button';

import { Table, Column, Cell } from 'fixed-data-table';

// App
import Exporter from './service/exporter';
import TemfUploader from './views/temfUploader'

require('fixed-data-table/dist/fixed-data-table.css');

import styles from './styles'

// Table data as a list of array.
const rows = [
  ['2018', 'temf-2018.xlsx', '2018/11/5'],
  ['2017', 'temf-2017.xlsx', '2017/12/22'],
  ['2016', 'temf-2016.xlsx', '2017/1/1']
];

const requiredSqlViews = [
  'temf-query-2018',
  'zithromax-app-query-2018'
]

class TemfManager extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      mode: 'manager',  // manager, upload
      loadingSettings: true,
      sqlViews: {},
      downloadYear: 2018,
      loadingDownload: false,
      loadingUpload: false,
    }

    var self = this;
    Promise.all([
      this.loadViews()
      ]).then((results) => {
        self.setState({sqlViews: results[0], loadingSettings: false});
      }) 
  }

  loadViews() {
    return new Promise(function(resolve, reject) {
      var q ='sqlViews?fields=id,displayName,attributeValues&pageSize=10000';
      d2.Api.getApi().get(q).then(function(results) {
        var views = {};
        for (var i = 0; i < results.sqlViews.length; i++) {
          var view = results.sqlViews[i]
          for (var j = 0; j < results.sqlViews.length; j++) {
            if (view.attributeValues[j]) {
              var index = requiredSqlViews.indexOf(view.attributeValues[j].value);
              if (index > -1) {
                views[requiredSqlViews[index]] = view;
              }
            }
          }
        }
        resolve(views);
      })
    });
  }

  downloadTemf = (e) => {
    var self = this;
    self.setState({loadingDownload: true})
    var exporter = new Exporter();
    Promise.all([
      self.getTemfData(self.state.downloadYear),
      self.getZithroAppData(self.state.downloadYear)
      ]).then((results) => {
        exporter.downloadTemf(2018, {
          temf: results[0],
          zithromaxApp: results[1]
        }, (e) => {
          self.setState({loadingDownload: false});
        });   
      }) 
  }
  getTemfData(year) {
    var id = this.state.sqlViews['temf-query-'+year].id;
    return this.getSqlViewData(id);
  }
  getZithroAppData(year) {
    var id = this.state.sqlViews['zithromax-app-query-'+year].id;
    return this.getSqlViewData(id);
  }
  getSqlViewData(id) {
    return new Promise(function(resolve, reject) {
      var q ='sqlViews/'+id+'/data.json?pageSize=10000';
      d2.Api.getApi().get(q).then(function(results) {
        resolve(results.listGrid);
      });
    });
  }

  uploadTemf = (e) => {
    this.setState({mode: 'upload'})
  }

  renderLoading() {
    return (
      <div className="content-area">
        <div style={styles.header}>
          TEMF / Zithromax Application Management
        </div>
        <Card style={styles.card}>
          <CardText>
            <p>Loading settings...</p>
          </CardText>
        </Card>
      </div>
    ) 
  }

  renderUpload() {
    return (
      <div className="content-area">
        <div style={styles.header}>
          TEMF / Zithromax Application Management
        </div>
        <TemfUploader cancel={(e)=>{this.setState({mode: 'manager'})}} />
      </div>
    ) 
  }



  render() {
    if (this.state.loadingSettings) {
      return this.renderLoading();
    }

    if (this.state.mode === 'upload') {
      return this.renderUpload();
    }

    var downloadView;
    if (this.state.loadingDownload) {
      downloadView = <p>Generating Workbook</p>
    } else {
      downloadView = (
        <div>
          <div>
          <SelectField floatingLabelText="TEMF Data Year"
            style={{marginRight: '1rem'}}
            value={''+this.state.downloadYear} >
            <MenuItem value="2018" primaryText="2018" />
          </SelectField>
          <RaisedButton default
            label="Export TEMF/App"
            onClick={this.downloadTemf}>
          </RaisedButton>
          </div>
        </div>
      )
    }

    return (
      <div className="content-area">
        <div style={styles.header}>TEMF / Zithromax Application Management</div>
        <Card style={styles.card}>
            <CardText>
                <h2>Download Workbook</h2>
                {downloadView}
            </CardText>
        </Card>

        <Card style={styles.card}>
          <CardText>
            <h2 style={{float: 'left'}}>Uploaded Workbooks</h2>
            <RaisedButton default  style={{float: 'right'}}
              label="Import TEMF/App"
              onClick={this.uploadTemf}>
            </RaisedButton>
            <Table
                rowHeight={60}
                rowsCount={rows.length}
                width={670}
                maxHeight={350}
                headerHeight={40}>
                <Column
                  header={<Cell>Year</Cell>}
                  cell={({rowIndex, ...props}) => (
                    <Cell {...props}>
                      {rows[rowIndex][0]}
                    </Cell>
                  )}
                  width={60}
                />
                <Column
                  header={<Cell>File</Cell>}
                  cell={({rowIndex, ...props}) => (
                    <Cell {...props}>
                      <a href="#">{rows[rowIndex][1]}</a>
                    </Cell>
                  )}
                  width={330}
                />
                <Column
                  header={<Cell>Uploaded On</Cell>}
                  cell={({rowIndex, ...props}) => (
                    <Cell {...props}>
                      {rows[rowIndex][2]}
                    </Cell>
                  )}
                  width={120}
                />
                <Column
                  header={<Cell></Cell>}
                  cell={({rowIndex, ...props}) => (
                    <Cell {...props}>
                        <RaisedButton default size="small" fullWidth={false}
                            label="Export Workbook"
                            onClick={this.downloadWorkbook}>
                        </RaisedButton>
                    </Cell>
                  )}
                  width={160}
                />
              </Table>
          </CardText>
        </Card>
      </div>
    );

  }

}

export default TemfManager;