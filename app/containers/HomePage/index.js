/**
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { Grid } from '@material-ui/core';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { Helmet } from 'react-helmet';
import reducer from './reducer';
import saga from './saga';
import StateDialog from '../../components/StateDialog';
import { CenteredSection } from '../../utils/styledUtil';
import YouQuizTopBar from '../../components/YouQuizTopBar';

import {
  makeSelectHomeLoading,
  makeSelectHomeSuccessMessage,
  makeSelectHomeErrorMessage,
  makeSelectHomeSearchWith,
  makeSelectHomeColorMapBy,
  makeSelectHomeColorMapPerCapita,
} from './selectors';
import {
  changeSearchWith,
  changeColorMapBy,
  changeColorMapPerCapita,
} from './actions';
import { clearStateDialog } from '../../utils/dialogState';
import CovidMap from '../../components/CovidMap';
import CovidPlot from '../../components/CovidPlot';
import CovidTable from '../../components/CovidTable';

const key = 'homePage';

export function HomePage({
  loading,
  successMessage,
  errorMessage,
  searchWith,
  colorMapBy,
  colorMapPerCapita,
  onClickDialogOk,
  onChangeSearchWith,
  onChangeColorMapBy,
  onChangeColorMapPerCapita,
}) {
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  const [data, setData] = React.useState({});

  const stateDialogProps = {
    loading,
    successMessage,
    errorMessage,
    onClickDialogOk,
  };

  const youQuizTopBarProps = {
    data,
    searchWith,
    colorMapBy,
    colorMapPerCapita,
    onChangeSearchWith,
    onChangeColorMapBy,
    onChangeColorMapPerCapita,
  };

  const covidMapProps = {
    data,
    searchWith,
    colorMapBy,
    colorMapPerCapita,
  };

  const covidPlotProps = {
    data,
    perCapita: colorMapPerCapita,
  };

  React.useEffect(() => {
    // eslint-disable-next-line global-require
    const d = require('../../data/us/0.json');
    // eslint-disable-next-line global-require
    // const d = require('./data.json');
    setData(d);
  }, []);

  return (
    <article>
      <Helmet>
        <title>COVID-19</title>
        <meta name="description" content="COVID 19 Statistics" />
      </Helmet>
      <div>
        <CenteredSection>
          <YouQuizTopBar {...youQuizTopBarProps} />
          <Grid container spacing={3}>
            <Grid item xs={3} />
            <Grid item xs={6}>
              <CovidMap {...covidMapProps} />
            </Grid>
            <Grid item xs={3} />
            <Grid item xs={12}>
              <CovidPlot {...covidPlotProps} />
            </Grid>
          </Grid>
        </CenteredSection>
        <StateDialog {...stateDialogProps} />
      </div>
    </article>
  );
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  successMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  searchWith: PropTypes.string,
  colorMapBy: PropTypes.oneOf(['confirmed', 'deaths']),
  colorMapPerCapita: PropTypes.bool,
  onClickDialogOk: PropTypes.func,
  onChangeSearchWith: PropTypes.func,
  onChangeColorMapBy: PropTypes.func,
  onChangeColorMapPerCapita: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectHomeLoading(),
  successMessage: makeSelectHomeSuccessMessage(),
  errorMessage: makeSelectHomeErrorMessage(),
  searchWith: makeSelectHomeSearchWith(),
  colorMapBy: makeSelectHomeColorMapBy(),
  colorMapPerCapita: makeSelectHomeColorMapPerCapita(),
});

function mapDispatchToProps(dispatch) {
  return {
    onClickDialogOk: () => {
      dispatch(clearStateDialog());
    },
    onChangeSearchWith: evt => {
      dispatch(changeSearchWith(evt.target.value));
    },
    onChangeColorMapBy: evt => {
      dispatch(changeColorMapBy(evt.target.value));
    },
    onChangeColorMapPerCapita: evt => {
      dispatch(changeColorMapPerCapita(evt.target.checked));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(HomePage);
