# DHIS2 PC NTD Data Management App

The PC NTD Data Management App allows simple import/export of the NTD reporting data via the DHIS2 web interface.  Each section supports importing and exporting of 1 type of workbook.

## Configuration

The app is configured via the `src/appConfig.js` file that specifies:

  1. The data store location for logs of imported workbooks
  2. The parsers available for each workbook for each year of importable data
  3. The views available for each workbook for each year of exportable data

## Exporting

The exporting is supported via SQL views in the DHIS2 system.  Each data year / workbook combination requires a set of views.  Each year->workbook has in the configuration a view specifed.

Selecting a workbook and year to download will create a new blank Excel workbook with un-styled sheets for each of the named views in the download configuration.  These value may then be pasted into an actual reporting workbook if desired.

## Importing

The importing is supported via an import framework with parsers for each of the workbook types and years (if they are different, some reporting workbook formats are the same for several years).

The parsers are all located at `src/parsers/` and are wired up to year/workbook combinations in the `src/appConfig.js` file. 

The parsers transform the workbook to a JSON importable file that is then uploaded to the data import API for the DHIS2 instance.  The results of that import are displayed to the user and stored in the DHIS2 data store if the import was not a dry run.


## Data Store Objects:

**/dhis2-web-pcntd/:workbookType**

```json
{
  "uploads": [
    {
      "dataYear": 2018,
      "fileType": "temf/epirf/jrf",
      "filename": "upload.xlsx",
      "uploaded_at": "2019-01-01 00:00:00",
      "user": {
        "id": "ID",
        "name": "Name",
        "username": "username"
      },
      "logId": "Y0moqFplrX4"
    }
  ]
}
```

**/dhis2-web-pcntd-logs/:id**

```json
{
  "payload": {},
  "importSummary": {}
}
```
