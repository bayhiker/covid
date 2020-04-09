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
import { useLocation } from 'react-router-dom';

import { Grid } from '@material-ui/core';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { Helmet } from 'react-helmet';
import reducer from './reducer';
import saga from './saga';
import StateDialog from '../../components/StateDialog';
import { CenteredSection } from '../../utils/styledUtil';
import YouQuizTopBar from '../../components/YouQuizTopBar';
import { stateFips } from '../../utils/mapUtils';

import {
  makeSelectHomeLoading,
  makeSelectHomeSuccessMessage,
  makeSelectHomeErrorMessage,
  makeSelectHomeSearchWith,
  makeSelectHomeColorMapBy,
  makeSelectHomeColorMapPerCapita,
  makeSelectHomeZoomState,
} from './selectors';
import {
  changeSearchWith,
  changeColorMapBy,
  changeColorMapPerCapita,
  updateZoomState,
} from './actions';
import { clearStateDialog } from '../../utils/dialogState';
import CovidMap from '../../components/CovidMap';
import CovidPlot from '../../components/CovidPlot';

const key = 'homePage';

export function HomePage({
  loading,
  successMessage,
  errorMessage,
  searchWith,
  colorMapBy,
  colorMapPerCapita,
  zoomState,
  onClickDialogOk,
  onChangeSearchWith,
  onChangeColorMapBy,
  onChangeColorMapPerCapita,
  onUpdateZoomState,
}) {
  const [data, setData] = React.useState({});
  const location = useLocation();
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  React.useEffect(() => {
    processLocation();
    loadData();
  }, [zoomState.dataUrl]);

  const processLocation = () => {
    // TODO load data from web service
    const { pathname } = location;
    const [, country, state, county] = pathname.split('/');
    console.log(`Process location: ${country}, ${state}, ${county}`);
    let [zoom, geoId] = [1, '0'];
    if (country === 'us') {
      console.log('Country is us');
      if (state) {
        const fips = stateFips[state.toUpperCase()];
        console.log(`State is ${state}, fips is ${fips}`);
        if (fips) {
          zoom = 2;
          geoId = fips;
        }
      }
      updateZoomState({ zoom, geoId });
    }
  };

  const loadData = () => {
    try {
      fetch(zoomState.dataUrl)
        .then(response => response.json())
        .then(d => {
          setData(d);
        });
    } catch (error) {
      // TODO Show alert here
    }
  };
  const stateDialogProps = {
    loading,
    successMessage,
    errorMessage,
    onClickDialogOk,
  };

  const youQuizTopBarProps = {
    data,
    zoomState,
    searchWith,
    colorMapBy,
    colorMapPerCapita,
    onChangeSearchWith,
    onChangeColorMapBy,
    onChangeColorMapPerCapita,
  };

  const covidMapProps = {
    data,
    zoomState,
    searchWith,
    colorMapBy,
    colorMapPerCapita,
    onUpdateZoomState,
  };

  const covidPlotProps = {
    data,
    zoomState,
    perCapita: colorMapPerCapita,
  };

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
  zoomState: PropTypes.any,
  onClickDialogOk: PropTypes.func,
  onChangeSearchWith: PropTypes.func,
  onChangeColorMapBy: PropTypes.func,
  onChangeColorMapPerCapita: PropTypes.func,
  onUpdateZoomState: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectHomeLoading(),
  successMessage: makeSelectHomeSuccessMessage(),
  errorMessage: makeSelectHomeErrorMessage(),
  searchWith: makeSelectHomeSearchWith(),
  colorMapBy: makeSelectHomeColorMapBy(),
  colorMapPerCapita: makeSelectHomeColorMapPerCapita(),
  zoomState: makeSelectHomeZoomState(),
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
    onUpdateZoomState: zoomState => {
      dispatch(updateZoomState(zoomState));
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
