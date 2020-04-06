/**
 *
 * YouQuizPopover
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';
// import { FormattedMessage } from 'react-intl';
// import messages from './messages';
import { Popover, makeStyles } from '@material-ui/core';
import ConfirmationDialog from '../ConfirmationDialog';

const useStyles = makeStyles(theme => ({
  popover: {
    padding: theme.spacing(2),
  },
  anchorDiv: {},
}));

function YouQuizPopover({
  children,
  id = `id-youquiz-popover-${Math.floor(Math.random() * 1000000)}`,
  popoverContent,
  onClickPopoverAnchor = () => {},
  onClosePopover = () => {},
  showConfirmationDialog = () => false,
  confirmationDialogTitle = 'Confirmation',
  confirmationDialogContent = 'Close Popover?',
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [confirmClosePopover, setConfirmClosePopover] = React.useState(false);
  const handleClick = event => {
    onClickPopoverAnchor();
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
    onClosePopover();
  };

  const handleClose = () => {
    if (showConfirmationDialog()) {
      setConfirmClosePopover(true);
    } else {
      closePopover();
    }
  };
  const open = Boolean(anchorEl);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyPress={() => {}}
        onClick={handleClick}
      >
        {children}
      </div>
      <Popover
        id={id}
        className={classes.popover}
        width="80%"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {popoverContent}
      </Popover>
      <ConfirmationDialog
        title={confirmationDialogTitle}
        open={confirmClosePopover}
        setOpen={setConfirmClosePopover}
        onConfirm={() => {
          closePopover();
        }}
      >
        {confirmationDialogContent}
      </ConfirmationDialog>
    </div>
  );
}

YouQuizPopover.propTypes = {
  id: PropTypes.string,
  children: PropTypes.any,
  popoverContent: PropTypes.any,
  onClickPopoverAnchor: PropTypes.func,
  onClosePopover: PropTypes.func,
  showConfirmationDialog: PropTypes.func,
  confirmationDialogTitle: PropTypes.any,
  confirmationDialogContent: PropTypes.any,
};

export default YouQuizPopover;
