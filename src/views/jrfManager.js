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

];

class JrfManager extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      mode: 'manager',  // manager, upload
      loadingSettings: true,
      sqlViews: {},
      downloadYear: 2018,
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
      appDataStore.getUploadsForType('jrf').then(resolve);
    });
  }

  download = (e) => {

  }

  upload = (e) => {
    this.setState({mode: 'upload'})
  }

  renderLoading() {
    return (
      <div className="content-area">
        <div style={styles.header}>
          Joint Reporting Form Management
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
          Joint Reporting Form Management
        </div>
        <ParserUploader parserType='jrf'
          title="Upload JRF Workbook"
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
              <SelectField floatingLabelText="JRF Data Year"
                style={{marginRight: '1rem'}}
                value={''+this.state.downloadYear} >
                {yearOptions}
              </SelectField>
              <RaisedButton default
                label="Export JRF"
                onClick={this.download}>
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

    var uploadRows = this.state.uploads || [];

    return (
      <div className="content-area">
        <div style={styles.header}>Joint Reporting Form Management</div>
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
              label="Import JRF Workbook"
              onClick={this.upload}>
            </RaisedButton>
            <UploadsTable uploadRows={this.state.uploads || []} />
          </CardText>
        </Card>
      </div>
    );
  }

}

export default JrfManager;