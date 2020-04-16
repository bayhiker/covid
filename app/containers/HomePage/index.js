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
import { stateFips, usStates } from '../../utils/mapUtils';

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

  // 268689 is phone number code of the word county
  const zoomWithCountyHashPrefix = 2.0268689;

  React.useEffect(() => {
    processLocation();
  }, []);

  React.useEffect(() => {
    loadData();
  }, [zoomState.dataUrl]);

  const processLocation = () => {
    const { pathname } = location;
    const [, country, state, county] = pathname.split('/');
    if (country && country.toUpperCase() === 'US') {
      const newZoomState = { zoom: 1, geoId: '0' };
      if (state && state.length === 2) {
        const fips = stateFips[state.toUpperCase()];
        if (fips in usStates) {
          newZoomState.zoom = 2;
          newZoomState.geoId = fips;
          if (county && county.length >= 3) {
            // Shortest county name is Lee county, length 3
            newZoomState.zoom = getZoomWithCountyHash(county);
          }
        }
        newZoomState.center = [
          usStates[newZoomState.geoId].lon,
          usStates[newZoomState.geoId].lat,
        ];
      }
      onUpdateZoomState(newZoomState);
    }
  };

  const getZoomWithCountyHash = countyName => {
    // Get a code that uniquely identifies a county within a state
    // All chars multiplied together, mod 9999999 along the way
    let countyHash = 1;
    for (let i = 0; i < countyName.length; i += 1) {
      countyHash =
        (countyHash * countyName.toLowerCase().charCodeAt(i)) % 9999999;
    }
    return zoomWithCountyHashPrefix + countyHash / 10 ** 14;
  };

  const loadData = () => {
    try {
      fetch(zoomState.dataUrl)
        .then(response => response.json())
        .then(d => {
          setData(d);
          checkForCountyHash(d);
        });
    } catch (error) {
      // TODO Show alert here
    }
  };

  const checkForCountyHash = d => {
    // Check for county information encoded in a zoom a tiny bit larger than zoomWithCountyHashPrefix
    // For example, 2.00268689xxxx mean a county with index xxxx
    if (
      zoomState.zoom < zoomWithCountyHashPrefix ||
      zoomState.zoom > zoomWithCountyHashPrefix + 10 ** -7
    ) {
      return;
    }
    const zoomWithCountyHashTimesTen = Math.floor(zoomState.zoom * 10 ** 15);
    if (zoomWithCountyHashTimesTen % 10 !== 0) {
      return;
    }
    // Now we are resonably sure this is a zoom embedded with a county hash
    const countyHash = (zoomWithCountyHashTimesTen / 10) % 10 ** 7;
    if (!(`${countyHash}` in d.hashes)) {
      return;
    }
    const countyFips = d.hashes[countyHash];
    onUpdateZoomState({ zoom: 8, geoId: countyFips });
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
            <Grid item xs={12} md={4}>
              <CovidMap {...covidMapProps} />
            </Grid>
            <Grid item xs={12} md={8}>
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
