/**
 *
 * ConfirmationDialog
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from '@material-ui/core';

function ConfirmationDialog(props) {
  const { title, children, open, setOpen, onConfirm } = props;
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => setOpen(false)}
          color="default"
        >
          No
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="secondary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default ConfirmationDialog;
