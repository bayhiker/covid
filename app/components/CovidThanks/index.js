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
  Typography,
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
          primary="All Medical Personnels."
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                Doctors, nurses, pharmasists, assistants, aids, ...
              </Typography>
              {' Thanks for for keeping us safe!'}
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          <SchoolOutlined />
        </ListItemIcon>
        <ListItemText
          primary="John Hopkins University"
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                Whiting School of Engineering
              </Typography>
              {' Thanks for collecting and publishing detailed COVID-19 data'}
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          <GitHub />
        </ListItemIcon>
        <ListItemText
          primary="GitHub"
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                Community
              </Typography>
              {' A great force for good.'}
            </React.Fragment>
          }
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
