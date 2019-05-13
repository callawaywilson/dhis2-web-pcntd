import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import XLSX from 'xlsx';

// Material UI
import { Card, CardText, CardActions } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Button from 'd2-ui/lib/button/Button';
import LinearProgress from 'material-ui/LinearProgress';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';

import AppConfig from '../appConfig';
import ParserImporter from '../service/parserImporter';

import styles from '../styles';

class ParserUploader extends React.Component {

  constructor(props, context) {
    super(props, context);
    var importYears = AppConfig.importYears[props.parserType];
    this.state = {
      uploading: false,
      uploadedFile: null,
      importing: false,
      importingState: null,
      importingProgress: 0,
      dataYear: importYears[importYears.length - 1],
      parserType: props.parserType,
      parserYears: importYears,
      dryRun: false,
      importLog: null
    }
    this.workbook = null;
    this.importer = null;
  }

  handleYearChange = (evt, key, payload) => {
    this.setState({dataYear: parseInt(payload, 10)});
  }

  toggleDryRun = (e) => {
    this.setState({dryRun: e.target.checked});
  }

  clickUpload = (e) => {
    if (this.fileInput && !this.state.uploading) {
      this.fileInput.click(e);
      this.setState({uploading: true});
    }
  } 
  upload = (e) => {
    var self = this;
    var files = e.target.files, file = files[0];
    var reader = new FileReader();
    var rABS = !!reader.readAsBinaryString;
    reader.onload = function(e) {
      var data = e.target.result;
      if(!rABS) data = new Uint8Array(data);
      self.workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
      self.setState({uploading: false, uploadedFile: file});
    };
    if (rABS) {
      reader.readAsBinaryString(file); 
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  cancel = (e) => {
    if (this.props.cancel) this.props.cancel();
  }

  process = (e) => {
    this.setState({importing: true, importingState: 'start'});
    this.importer = new ParserImporter(
      this.state.dataYear, 
      AppConfig.parsers[this.state.dataYear+""][this.state.parserType],
      this.state.uploadedFile.name,
      this.workbook, 
      {dryRun: this.state.dryRun},
      this.importProgess
    );
    this.importer.import();
  }

  importProgess = (state, progress, importLog) => {
    this.setState({
      importingState: state, 
      importingProgress: progress, 
      importLog: importLog
    });
  }

  render() {
    return (
      <Card style={styles.card}>
        <CardText>
          <h2>{this.props.title}</h2>
          {this.state.importing ? this.renderImporting() : this.renderDefault()}
        </CardText>
        <CardActions>
          {this.renderButtons()}
        </CardActions>
      </Card>
    )
  }

  renderDefault() {   
    const setRef = (ref) => { this.fileInput = ref; };
    var dataYearMenuItems = [];
    for (var i = 0; i < this.state.parserYears.length; i++) {
      dataYearMenuItems.push(
        <MenuItem key={this.state.parserYears[i]+""}
          value={this.state.parserYears[i]+""} 
          primaryText={this.state.parserYears[i]+""} />
      );
    }
    return (
      <div>
        <Checkbox
            label="Dry Run (preview only)"
            onCheck={this.toggleDryRun}
            checked={this.state.dryRun} />
        <br/>
        <SelectField floatingLabelText="Data Year"
            value={''+this.state.dataYear}
            onChange={this.handleYearChange} >
            {dataYearMenuItems}
        </SelectField>
        <br/><br/>

        { 
          this.state.uploadedFile ? this.renderUploaded() :
            this.state.uploading ? this.renderUploading() : this.renderUpload()
        }
        <input type="file"
          style={{ visibility: 'hidden', display: 'none' }}
          ref={setRef}
          onChange={this.upload} />
      </div>
    )
  }

  renderUpload() {
    return (
      <RaisedButton label="Select Workbook File" 
        onClick={this.clickUpload} />
    );
  }

  renderUploading() {
    const progressStyle = {
      position: 'relative',
      left: 0,
      right: 0,
      zIndex: 1,
    };

    return (
      <div>
        <div style={progressStyle}>
          <LinearProgress
            mode={this.state.uploadProgress ? 'determinate' : 'indeterminate'}
            value={this.state.uploadProgress} />
        </div>
      </div>
    );
  }

  renderUploaded() {
    return (
      <div>
        <strong>Workbook File:</strong>
        &nbsp;
        {this.state.uploadedFile.name}
      </div>
    )
  }

  renderImporting() {
    const progressStyle = {
      position: 'relative',
      left: 0,
      right: 0,
      zIndex: 1,
    };

    var content;
    if (this.state.importingState === 'complete') {
      var importSummary = this.state.importLog.importSummary;
      var conflicts = '';
      if (importSummary.conflicts && importSummary.conflicts.length > 0) {
        conflicts = (
          <div>
            <h4>Import Conflicts</h4>
            <ul>
            {importSummary.conflicts.map((conflict) => {
              return (
                <li key={conflict.object}><strong>{conflict.object}</strong>: {conflict.value}</li>
              )
            })}
            </ul>
          </div>
        )
      }
      content = (
        <div> 
          <h4>Import Summary</h4> 
          <ul>
            <li><strong>Data Year</strong>: {this.state.dataYear}</li>
            <li><strong>Workbook</strong>: {this.state.uploadedFile.name}</li>
          </ul>
          <p><strong>Import Result Status:</strong> {importSummary.status}</p>
          <p><strong>Import Count</strong></p>
          <ul>
            <li><strong>Deleted</strong>: {importSummary.importCount.deleted}</li>
            <li><strong>Ignored</strong>: {importSummary.importCount.ignored}</li>
            <li><strong>Imported</strong>: {importSummary.importCount.imported}</li>
            <li><strong>Updated</strong>: {importSummary.importCount.updated}</li>
          </ul>
          {conflicts}
          <Card>
            <CardText style={{whiteSpace: 'pre', overflowX: 'scroll'}}>
              {importSummary.description}
            </CardText>
          </Card>
        </div>
      )
    } else {
      content = (
        <div>
          <h4>Importing Progress...</h4>
          <ul>
            <li><strong>Data Year</strong>: {this.state.dataYear}</li>
            <li><strong>Workbook</strong>: {this.state.uploadedFile.name}</li>
          </ul>
          <div style={progressStyle}>
            <LinearProgress
              mode={this.state.importingProgress ? 'determinate' : 'indeterminate'}
              value={this.state.importingProgress} />
          </div>
        </div>
      )
    }

    return (
      <div>
        {content}
      </div>
    )
  }

  renderButtons() {
    if (this.state.importing && this.state.importingState === 'complete') {
      return (
        <Button size="small" color="default" onClick={this.cancel}>
          OK
        </Button>
      )
    } else {
      return (<div>
        <Button size="small" color="primary" 
          disabled={!this.state.uploadedFile || this.state.importing}
          onClick={this.process}>
          {this.state.importing ? 'Importing...' : 'Import'}
        </Button>
        <Button size="small" color="default" onClick={this.cancel}>
          Cancel
        </Button>
      </div>)
    }
  }

}

export default ParserUploader;