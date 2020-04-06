/**
 *
 * YouQuizTopBar
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { fade, makeStyles } from '@material-ui/core/styles';
import {
  Toolbar,
  AppBar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import MoreIcon from '@material-ui/icons/MoreVert';
import Form from './Form';

const useStyles = makeStyles(theme => ({
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
  toolbar: {
    width: '100%',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
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
    searchWith,
    colorMapBy,
    colorMapPerCapita,
    onChangeSearchWith,
    onChangeColorMapBy,
    onChangeColorMapPerCapita,
  } = props;
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Guest</MenuItem>
    </Menu>
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
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Typography className={classes.title} variant="h6" noWrap>
            COVID-19
          </Typography>
          <div className={classes.grow} />
          <FormControl required>
            <InputLabel htmlFor="age-native-required">Color Map By</InputLabel>
            <Select
              native
              value={colorMapBy}
              onChange={onChangeColorMapBy}
              name="colorMapBy"
              inputProps={{
                id: 'color-map-by-native-required',
              }}
            >
              <option value="deaths">Deaths</option>
              <option value="confirmed">Confirmed</option>
            </Select>
          </FormControl>
          <div className={classes.grow} />
          <FormControlLabel
            value="per-capita"
            control={
              <Switch color="secondary" onChange={onChangeColorMapPerCapita} />
            }
            label="Per Capita"
            labelPlacement="start"
          />
          <div className={classes.grow} />
          <div>
            <Form>
              <label htmlFor="problemsFilter">
                <TextField
                  id="search"
                  label="Search"
                  type="search"
                  value={searchWith}
                  onChange={onChangeSearchWith}
                />
              </label>
            </Form>
          </div>
          <div>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
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
      {renderMobileMenu}
      {renderMenu}
    </div>
  );
}

YouQuizTopBar.propTypes = {
  searchWith: PropTypes.string,
  colorMapBy: PropTypes.oneOf(['confirmed', 'deaths']),
  colorMapPerCapita: PropTypes.bool,
  onChangeSearchWith: PropTypes.func,
  onChangeColorMapBy: PropTypes.func,
  onChangeColorMapPerCapita: PropTypes.func,
};

export default YouQuizTopBar;
