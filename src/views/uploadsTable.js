import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

// Material UI
import RaisedButton from 'material-ui/RaisedButton';
import Button from 'd2-ui/lib/button/Button';

import { Table, Column, Cell } from 'fixed-data-table';
require('fixed-data-table/dist/fixed-data-table.css');

import styles from '../styles'

class UploadsTable extends React.Component {

  render() {
    var uploadRows = this.props.uploadRows;
    return (
      <Table
        rowHeight={60}
        rowsCount={uploadRows.length}
        width={670}
        maxHeight={350}
        headerHeight={40}>
        <Column
          header={<Cell>Year</Cell>}
          cell={({rowIndex, ...props}) => (
            <Cell {...props}>
              {uploadRows[rowIndex].dataYear}
            </Cell>
          )}
          width={60}
        />
        <Column
          header={<Cell>File</Cell>}
          cell={({rowIndex, ...props}) => (
            <Cell {...props}>
              {uploadRows[rowIndex].filename}
            </Cell>
          )}
          width={330}
        />
        <Column
          header={<Cell>Uploaded On</Cell>}
          cell={({rowIndex, ...props}) => (
            <Cell {...props}>
              {uploadRows[rowIndex].uploaded_at}
            </Cell>
          )}
          width={120}
        />
        <Column
          header={<Cell>Uploaded By</Cell>}
          cell={({rowIndex, ...props}) => (
            <Cell {...props}>
              {uploadRows[rowIndex].user.name}
            </Cell>
          )}
          width={160}
        />
      </Table>
    )
  }

}
export default UploadsTable;