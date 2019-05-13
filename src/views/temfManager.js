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
import Exporter from '../service/exporter';
import ParserUploader from '../views/parserUploader';
import UploadsTable from '../views/uploadsTable';
import AppDataStore from '../service/appDataStore';
import AppConfig from '../appConfig';

require('fixed-data-table/dist/fixed-data-table.css');

import styles from '../styles'

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
      downloadYear: '2018',
      loadingDownload: false,
      loadingUpload: false,
      uploads: []
    }

    var self = this;

    Promise.all([
      this.loadViews(),
      this.loadUploads()
    ]).then((results) => {
      self.setState({
        sqlViews: results[0], 
        uploads: results[1],
        loadingSettings: false
      });
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

  loadUploads() {
    return new Promise(function(resolve, reject) {
      var api = d2.Api.getApi();
      var appDataStore = new AppDataStore(d2);
      appDataStore.getUploadsForType('temf').then(resolve);
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
        if (!results[0] || !results[1]) {
          self.setState({loadingDownload: false});
        } else {
          exporter.downloadTemf(2018, {
            temf: results[0],
            zithromaxApp: results[1]
          }, (e) => {
            self.setState({loadingDownload: false});
          });  
        } 
      }) 
  }
  getTemfData(year) {
    var view = this.state.sqlViews['temf-query-'+year];
    if (view) {
      var id = view.id;
      return this.getSqlViewData(id);
    } else {
      alert('Unable to find SQL view temf-query-'+year)
      return false;
    }
  }
  getZithroAppData(year) {
    var view = this.state.sqlViews['zithromax-app-query-'+year];
    if (view) {
      var id = view.id;
      return this.getSqlViewData(id);
    } else {
      alert('Unable to find SQL view zithromax-app-query-'+year);
      return false;
    }
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
        <ParserUploader parserType='temf'
          title="Upload TEMF / Zithromax Application Workbook"
          cancel={(e)=>{this.setState({mode: 'manager'})}} 
        />
      </div>
    ) 
  }

  renderDownload() {
    if (this.state.loadingDownload) {
      return <p>Generating Workbook</p>
    } else {
      var yearOptions = [];
      for (var i = 0; i < AppConfig.downloadYears.length; i++) {
        var year = '' + AppConfig.downloadYears[i];
        yearOptions.push(<MenuItem key={year} value={year} 
          primaryText={year} />)
      }
      return (
        <div>
          <div>
          <SelectField floatingLabelText="TEMF Data Year"
            style={{marginRight: '1rem'}}
            value={''+this.state.downloadYear} >
            {yearOptions}
          </SelectField>
          <RaisedButton default
            label="Export TEMF/App"
            onClick={this.downloadTemf}>
          </RaisedButton>
          </div>
        </div>
      )
    }
  }


  render() {
    if (this.state.loadingSettings) {
      return this.renderLoading();
    }

    if (this.state.mode === 'upload') {
      return this.renderUpload();
    }

    return (
      <div className="content-area">
        <div style={styles.header}>TEMF / Zithromax Application Management</div>
        <Card style={styles.card}>
            <CardText>
                <h2>Download Workbook Data</h2>
                {this.renderDownload()}
            </CardText>
        </Card>

        <Card style={styles.card}>
          <CardText>
            <h2 style={{float: 'left'}}>Uploaded Workbooks</h2>
            <RaisedButton default  style={{float: 'right'}}
              label="Import TEMF/App"
              onClick={this.uploadTemf}>
            </RaisedButton>
            <UploadsTable uploadRows={this.state.uploads || []} />
          </CardText>
        </Card>
      </div>
    );

  }

}

export default TemfManager;