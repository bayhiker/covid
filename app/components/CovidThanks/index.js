/**
 *
 * CovidThanks
 *
 */

import React from 'react';
import {
  makeStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { SchoolOutlined, LocalHospital, GitHub } from '@material-ui/icons';
import YouQuizPopover from '../YouQuizPopover';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
}));

function CovidThanks({ children }) {
  const classes = useStyles();
  const popoverContent = (
    <List className={classes.root}>
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          <LocalHospital />
        </ListItemIcon>
        <ListItemText
          primary="Medical Personnels."
          secondary={<React.Fragment>And all COVID-19 helpers!</React.Fragment>}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          <SchoolOutlined />
        </ListItemIcon>
        <ListItemText
          primary="John Hopkins University"
          secondary={<React.Fragment>And all data publishers</React.Fragment>}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          <GitHub />
        </ListItemIcon>
        <ListItemText
          primary="GitHub Community"
          secondary={<React.Fragment>A great force for good.</React.Fragment>}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </List>
  );

  const youQuizPopoverProps = {
    children,
    popoverContent,
  };

  return <YouQuizPopover {...youQuizPopoverProps} />;
}

CovidThanks.propTypes = {
  children: PropTypes.any,
};

export default CovidThanks;
