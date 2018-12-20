import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// D2 UI
import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';

import appTheme from './theme';

import TemfManager from './temfManager';
import JapManager from './japManager';

const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

// Sidebar Sections Layout
const Sections = [
  {key: 'temf', label: 'TEMF / Zithromax App', icon: 'folder'},
  {key: 'jap', label: 'Joint Application Matrix', icon: 'folder'}
]

class Application extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
          category: 'temf'
        }
    }

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: appTheme,
        };
    }

    setCategory(self, category) {
      // Use self, SidebarComponent seems to change this.
      self.setState({'category': category})
    }

    render() {
      var self = this;
      var page = <div></div>;
      if (this.state.category == 'temf') {
        page = <TemfManager d2={this.props.d2} />
      } else if (this.state.category == 'jap') {
        page = <JapManager d2={this.props.d2} />
      }

      return (
          <MuiThemeProvider muiTheme={appTheme}>
              <div className="app">
                  <HeaderBar />
                  <Sidebar
                      sections={Sections}
                      onChangeSection={function(category) {
                        self.setCategory(self, category)
                      }}
                      currentSection={this.state.category}
                  />
                  {page}
              </div>
          </MuiThemeProvider>
      );
    }
}

Application.propTypes = { d2: React.PropTypes.object.isRequired };
Application.contextTypes = { muiTheme: React.PropTypes.object };
Application.childContextTypes = { d2: React.PropTypes.object, muiTheme: React.PropTypes.object };

export default Application;