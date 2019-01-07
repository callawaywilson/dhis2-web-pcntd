import AppTheme from './theme';

export default {
  header: {
    fontSize: 24,
    fontWeight: 300,
    color: AppTheme.rawTheme.palette.textColor,
    padding: '24px 0 12px 16px',
  },
  card: {
    marginTop: 8,
    marginRight: '1rem',
    padding: '0 1rem',
  },
  cardTitle: {
    background: AppTheme.rawTheme.palette.primary2Color,
    height: 62,
  },
  cardTitleText: {
    fontSize: 28,
    fontWeight: 100,
    color: AppTheme.rawTheme.palette.alternateTextColor,
  },
  noHits: {
    padding: '1rem',
    marginTop: '1rem',
    fontWeight: 300,
  },
  userSettingsOverride: {
    color: AppTheme.rawTheme.palette.primary1Color,
    position: 'absolute',
    right: 0,
    top: 24,
  },
  menuIcon: {
    color: '#757575',
  },
  menuLabel: {
    position: 'relative',
    top: -6,
    marginLeft: 16,
  },
};