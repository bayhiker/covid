/**
 *
 * YouQuizTopBar
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { fade, makeStyles } from '@material-ui/core/styles';
import {
  Toolbar,
  AppBar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  FormLabel,
  RadioGroup,
  Radio,
  Tooltip,
  Paper,
  Link,
} from '@material-ui/core';
import { Favorite, Storage } from '@material-ui/icons';
import MoreIcon from '@material-ui/icons/MoreVert';
import ForumIcon from '@material-ui/icons/Forum';

import CovidTable from '../CovidTable';
import CovidThanks from '../CovidThanks';

const useStyles = makeStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  appBar: {
    background: '#b3e5fc',
  },
  blackText: {
    color: 'black',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    color: 'black',
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

function YouQuizTopBar(props) {
  const {
    data,
    zoomState,
    searchWith,
    colorMapBy,
    colorMapPerCapita,
    onChangeSearchWith,
    onChangeColorMapBy,
    onChangeColorMapPerCapita,
  } = props;
  const classes = useStyles();

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const colorMapByRadioGroup = (
    <FormControl component="fieldset">
      <FormLabel component="legend">Color Map By</FormLabel>
      <RadioGroup
        row
        aria-label="position"
        name="colorMapBy"
        value={colorMapBy}
        defaultValue="confirmed"
        onChange={onChangeColorMapBy}
      >
        <FormControlLabel
          value="confirmed"
          control={<Radio color="primary" />}
          label={
            <Typography className={classes.blackText}>Confirmed</Typography>
          }
        />
        <FormControlLabel
          value="deaths"
          control={<Radio color="primary" />}
          label={<Typography className={classes.blackText}>Deaths</Typography>}
        />
      </RadioGroup>
    </FormControl>
  );
  const colorMapPerCapitaSwitch = (
    <FormControlLabel
      value="per-capita"
      control={
        <Switch color="secondary" onChange={onChangeColorMapPerCapita} />
      }
      checked={colorMapPerCapita}
      classes={classes.perCapitaSwitch}
      label={<Typography className={classes.blackText}>Per Capita</Typography>}
      labelPlacement="start"
    />
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>{colorMapByRadioGroup}</MenuItem>
      <MenuItem>{colorMapPerCapitaSwitch}</MenuItem>
    </Menu>
  );

  const covidTableProps = {
    data,
    zoomState,
  };

  return (
    <div className={classes.grow}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            COVID-19
          </Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            {colorMapByRadioGroup}
            <div className={classes.grow} />
            {colorMapPerCapitaSwitch}
          </div>
          <div className={classes.grow} />
          <div>
            <CovidTable {...covidTableProps}>
              <Tooltip title="Data Table">
                <IconButton>
                  <Storage />
                </IconButton>
              </Tooltip>
            </CovidTable>
          </div>
          <div>
            <Link
              href="https://youquiz.me/community"
              target="_blank"
              rel="noreferrer"
            >
              <IconButton>
                <ForumIcon />
              </IconButton>
            </Link>
          </div>
          <div>
            <CovidThanks>
              <Tooltip title="Thanks">
                <IconButton color="secondary">
                  <Favorite />
                </IconButton>
              </Tooltip>
            </CovidThanks>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Paper>
        <div className={classes.toolbar} />
      </Paper>
      {renderMobileMenu}
    </div>
  );
}

YouQuizTopBar.propTypes = {
  searchWith: PropTypes.string,
  colorMapBy: PropTypes.oneOf(['confirmed', 'deaths']),
  colorMapPerCapita: PropTypes.bool,
  data: PropTypes.any,
  zoomState: PropTypes.any,
  onChangeSearchWith: PropTypes.func,
  onChangeColorMapBy: PropTypes.func,
  onChangeColorMapPerCapita: PropTypes.func,
};

export default YouQuizTopBar;
