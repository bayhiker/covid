/**
 *
 * StateDialog
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Typography,
  DialogActions,
  Button,
} from '@material-ui/core';

function StateDialog({
  loading,
  successMessage,
  errorMessage,
  onClickDialogOk,
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setDialogOpen(
      loading !== false || successMessage !== false || errorMessage !== false,
    );
  }, [loading, successMessage, errorMessage]);

  let title = '';
  if (successMessage !== false) {
    title = 'Success';
  } else if (errorMessage !== false) {
    title = 'Error';
  }
  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-problem"
      open={dialogOpen}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent dividers>
        {loading !== false && <CircularProgress />}
        {successMessage !== false && <Typography>{successMessage}</Typography>}
        {errorMessage !== false && <Typography>{errorMessage}</Typography>}
      </DialogContent>
      <DialogActions>
        {loading || (
          <Button onClick={onClickDialogOk} color="primary">
            Ok
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

StateDialog.propTypes = {
  loading: PropTypes.bool,
  successMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onClickDialogOk: PropTypes.func,
};

export default StateDialog;
