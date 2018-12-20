import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import { init, config, getUserSettings, getManifest } from 'd2/lib/d2';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Application from './application'

// D2 UI
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';



import appTheme from './theme';

// import settingsActions from './settingsActions';
// import configOptionStore from './configOptionStore';
// import settingsActionsttingsKeyMapping from './settingsKeyMapping';


const dhisDevConfig = DHIS_CONFIG; // eslint-disable-line

import './styles.scss';

ReactDOM.render(
    <MuiThemeProvider muiTheme={appTheme}><LoadingMask /></MuiThemeProvider>,
    document.getElementById('app'),
);

getManifest('manifest.webapp')
    .then((manifest) => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        config.baseUrl = `${baseUrl}/api/26`;
        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);
    })
    .then(getUserSettings)
    .then(init)
    .then((d2) => {
        // App init
        log.info('D2 initialized', d2);
        window.d2 = d2;

        ReactDOM.render(
            <MuiThemeProvider muiTheme={appTheme}><Application d2={d2} /></MuiThemeProvider>,
            document.getElementById('app'),
        );
    });
