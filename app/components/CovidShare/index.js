import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, TextField, IconButton, Snackbar } from '@material-ui/core';
import FileCopySharpIcon from '@material-ui/icons/FileCopySharp';
import { Alert, AlertTitle } from '@material-ui/lab';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TumblrShareButton,
  TumblrIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';
import YouQuizPopover from '../YouQuizPopover';
import { getSearchString } from '../../utils/searchParams';

const useStyles = makeStyles(() => ({
  shareNetwork: {
    verticalAlign: 'top',
    display: 'inline - block',
    marginRight: '10px',
    textAlign: 'center',
  },
  shareButton: {
    cursor: 'pointer',
  },
}));

function CovidShare({ children, covidState }) {
  const classes = useStyles();
  const { protocol, host, pathname } = window.location;
  const shareUrl = `${protocol}//${host}${pathname}?${getSearchString(
    covidState,
  )}`;
  const title = 'COVID-19';
  const [statusBarOpen, setStatusBarOpen] = React.useState(false);
  const handleCloseStatusBar = () => {
    setStatusBarOpen(false);
  };

  const popoverContent = (
    <div className={classes.shareContainer}>
      <div>
        <TextField
          id="share-url-text-field"
          defaultValue={shareUrl}
          InputProps={{
            readOnly: true,
          }}
        />
        <CopyToClipboard
          text={shareUrl}
          onCopy={() => {
            setStatusBarOpen(true);
          }}
        >
          <IconButton>
            <FileCopySharpIcon />
          </IconButton>
        </CopyToClipboard>
      </div>
      <div className={classes.shareNetwork}>
        <EmailShareButton
          url={shareUrl}
          subject={title}
          body="body"
          className={classes.shareButton}
        >
          <EmailIcon size={32} round />
        </EmailShareButton>
        <FacebookShareButton
          url={shareUrl}
          quote={title}
          className={classes.shareButton}
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        <WhatsappShareButton
          url={shareUrl}
          title={title}
          separator=":: "
          className={classes.shareButton}
        >
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
        <TwitterShareButton
          url={shareUrl}
          title={title}
          className={classes.shareButton}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <RedditShareButton
          url={shareUrl}
          title={title}
          windowWidth={660}
          windowHeight={460}
          className={classes.shareButton}
        >
          <RedditIcon size={32} round />
        </RedditShareButton>
        <TumblrShareButton
          url={shareUrl}
          title={title}
          className={classes.shareButton}
        >
          <TumblrIcon size={32} round />
        </TumblrShareButton>
        <LinkedinShareButton url={shareUrl} className={classes.shareButton}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>
      <Snackbar
        open={statusBarOpen}
        autoHideDuration={3000}
        onClose={handleCloseStatusBar}
      >
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          URL successfully copied to clipboard.
        </Alert>
      </Snackbar>
    </div>
  );
  const youQuizPopoverProps = {
    children,
    popoverContent,
  };

  return <YouQuizPopover {...youQuizPopoverProps} />;
}

CovidShare.propTypes = {
  children: PropTypes.any,
  covidState: PropTypes.any,
};

export default CovidShare;
