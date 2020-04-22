import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { geoCentroid } from 'd3';
import ReactTooltip from 'react-tooltip';
import { Typography } from '@material-ui/core';

import {
  usStates,
  zoomLevelIsCountry,
  zoomLevelIsCounty,
  geoIsCounty,
  geoIsState,
} from '../../utils/mapUtils';
import { CenteredSection } from '../../utils/styledUtil';
import { prevDateTitle } from '../../utils/dateUtils';

const colorScale = scaleQuantize()
  .domain([1, 10])
  .range([
    '#ffedea',
    '#ffcec5',
    '#ffad9f',
    '#ff8a75',
    '#ff5533',
    '#e2492d',
    '#be3d26',
    '#9a311f',
    '#782618',
  ]);

const stateOffsets = {
  VT: [50, -8],
  NH: [34, 2],
  MA: [30, -1],
  RI: [28, 2],
  CT: [35, 10],
  NJ: [34, 1],
  DE: [33, 0],
  MD: [47, 10],
  DC: [49, 21],
};

const BIG_CASE_NUMBER = 10000000;
const DEFAULT_NEW_CASES = {
  confirmed: {
    minCases: BIG_CASE_NUMBER,
    maxCases: -1,
    minPerCapita: BIG_CASE_NUMBER,
    maxPerCapita: -1,
  },
  deaths: {
    minCases: BIG_CASE_NUMBER,
    maxCases: -1,
    minPerCapita: BIG_CASE_NUMBER,
    maxPerCapita: -1,
  },
}; // New cases on most recent date

function CovidMap({
  data,
  zoomState,
  searchWith,
  colorMapBy,
  colorMapPerCapita,
  colorMapNewCases,
  onUpdateZoomState,
}) {
  const [tooltipContent, setTooltipContent] = React.useState('');
  const [newCases, setNewCases] = React.useState(DEFAULT_NEW_CASES);
  let caption = '';
  const currentDate = data.most_recent_date;
  const { population, names } = data;

  const [logBounds, setLogBounds] = React.useState({
    lower: 0,
    span: 20,
  });

  const recalculateBounds = () => {
    if (!data || !data[colorMapBy] || !newCases || !newCases[colorMapBy]) {
      return;
    }
    const cases = colorMapNewCases
      ? newCases[colorMapBy]
      : data[colorMapBy][data.most_recent_date];
    const minCases = colorMapPerCapita ? cases.minPerCapita : cases.minCases;
    const maxCases = colorMapPerCapita ? cases.maxPerCapita : cases.maxCases;

    logBounds.lower = minCases === 0 ? 0 : Math.log2(minCases);
    logBounds.span =
      (maxCases === 0 ? 0 : Math.log2(maxCases)) - logBounds.lower;
  };

  React.useEffect(() => {
    recalculateNewCases();
    recalculateBounds();
  }, [data]);

  // Recalculate bounds even if no data was reloaded, for example if perCapita switch changed
  recalculateBounds();

  const recalculateNewCases = () => {
    const todayTitle = data.most_recent_date;
    if (!todayTitle) {
      return;
    }
    const updatedNewCases = DEFAULT_NEW_CASES;
    ['confirmed', 'deaths'].forEach(caseType => {
      const dataToday = data[caseType][todayTitle];
      const dataYesterday = data[caseType][prevDateTitle(todayTitle)];
      Object.keys(dataToday).forEach(fips => {
        if (!fips || !/^\d+$/.test(fips)) {
          return;
        }
        const newCasesForFips = dataToday[fips] - dataYesterday[fips];
        updatedNewCases[caseType][fips] = newCasesForFips;
        const newCasesPerCapita =
          (newCasesForFips / population[fips]) * 10 ** 6;
        if (
          newCasesForFips < 0 ||
          Number.isNaN(newCasesForFips) ||
          !Number.isFinite(newCasesForFips) ||
          newCasesPerCapita < 0 ||
          Number.isNaN(newCasesPerCapita) ||
          !Number.isFinite(newCasesPerCapita)
        ) {
          return;
        }
        if (newCasesForFips < newCases[caseType].minCases) {
          newCases[caseType].minCases = newCasesForFips;
        }
        if (newCasesForFips > newCases[caseType].maxCases) {
          newCases[caseType].maxCases = newCasesForFips;
        }
        if (newCasesPerCapita < newCases[caseType].minPerCapita) {
          newCases[caseType].minPerCapita = newCasesPerCapita;
        }
        if (newCasesPerCapita > newCases[caseType].maxPerCapita) {
          newCases[caseType].maxPerCapita = newCasesPerCapita;
        }
      });
    });
    setNewCases(updatedNewCases);
  };

  const getScale = cases => {
    let scale = 0;
    if (cases > 1 && logBounds.span !== 0) {
      scale = Math.floor(
        ((Math.log2(cases) - logBounds.lower) / logBounds.span) * 10,
      );
    }
    return scale;
  };

  const haveDataForGeo = geo => {
    if (zoomLevelIsCountry(zoomState)) {
      return true;
    }
    const currentLoadedGeo = zoomState.geoId;
    if (currentLoadedGeo === undefined || !geo || !geo.id) {
      return false;
    }
    return (
      geo.id === currentLoadedGeo ||
      geo.id.substring(0, 2) === currentLoadedGeo.substring(0, 2)
    );
  };

  const getGeoStats = (geo, date) => {
    const stats = {};
    stats.fipsFormatted = formatGeoId(geo.id);
    stats.geoName = names[stats.fipsFormatted];
    stats.population = population[stats.fipsFormatted];
    stats.confirmed = colorMapNewCases
      ? newCases.confirmed[stats.fipsFormatted]
      : data.confirmed[date][stats.fipsFormatted];
    stats.confirmedPerM = Math.ceil(
      (stats.confirmed / stats.population) * 10 ** 6,
    );
    stats.deaths = colorMapNewCases
      ? newCases.deaths[stats.fipsFormatted]
      : data.deaths[date][stats.fipsFormatted];
    stats.deathsPerM = Math.ceil((stats.deaths / stats.population) * 10 ** 6);
    stats.centroid = geoCentroid(geo);
    return stats;
  };

  const getStateMarkerAnnotation = geo => {
    if (
      !names ||
      !population ||
      !(zoomLevelIsCountry(zoomState) || zoomLevelIsCounty(zoomState)) ||
      !haveDataForGeo(geo)
    ) {
      return false;
    }
    const geoStats = getGeoStats(geo, currentDate);
    const isCounty = geoIsCounty(geo.id);
    let geoAbbreviation = 'US';
    if (isCounty) {
      geoAbbreviation = names[geo.id];
    } else if (geoIsState(geo.id)) {
      if (geo.id in usStates) {
        geoAbbreviation = usStates[geo.id].abbr;
      }
    }

    let suffix = '';
    if (colorMapPerCapita) {
      suffix = `${
        colorMapBy === 'confirmed'
          ? geoStats.confirmedPerM
          : geoStats.deathsPerM
      }`;
    } else if (colorMapBy === 'confirmed') {
      if (geoStats.confirmed >= 1000) {
        suffix = `${Math.ceil(geoStats.confirmed / 1000)}K`;
      } else {
        suffix = `${geoStats.confirmed}`;
      }
    } else {
      suffix = `${geoStats.deaths}`;
    }
    const getGeoMarkerOrAnnotation = () =>
      geoStats.geoName &&
      geoAbbreviation &&
      geoStats.centroid[0] > -160 &&
      geoStats.centroid[0] < -67 &&
      (geoAbbreviation in stateOffsets ? (
        <Annotation
          subject={geoStats.centroid}
          dx={stateOffsets[geoAbbreviation][0]}
          dy={stateOffsets[geoAbbreviation][1]}
          onClick={() => {
            handleMapClick(geo);
          }}
        >
          <text x={4} fontSize={14} alignmentBaseline="middle">
            {`${geoAbbreviation}(${suffix})`}
          </text>
        </Annotation>
      ) : (
        <Marker
          coordinates={geoStats.centroid}
          onClick={() => {
            handleMapClick(geo);
          }}
        >
          <text y="2" fontSize={isCounty ? 2 : 14} textAnchor="middle">
            {`${geoAbbreviation}(${suffix})`}
          </text>
        </Marker>
      ));

    return (
      <g
        key={`${geo.rsmKey}-name`}
        onMouseEnter={() => {
          setTooltipContent(getTooltipContent(geo));
        }}
        onMouseLeave={() => {
          setTooltipContent('');
        }}
      >
        {zoomLevelIsCountry(zoomState) || zoomLevelIsCounty(zoomState)
          ? getGeoMarkerOrAnnotation(geo)
          : ''}
      </g>
    );
  };

  const getStateOrCountyGeography = geo => {
    if (!names || !population || !haveDataForGeo(geo)) {
      return false;
    }
    let cases = 0;
    const fipsFormatted = formatGeoId(geo.id);
    if (data && currentDate) {
      cases = colorMapNewCases
        ? newCases[colorMapBy][fipsFormatted]
        : data[colorMapBy][currentDate][fipsFormatted];
      if (colorMapPerCapita) {
        cases = (cases / population[fipsFormatted]) * 10 ** 6;
      }
    }
    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        fill={colorScale(cases !== undefined ? getScale(cases) : '#EEE')}
        onMouseEnter={() => {
          setTooltipContent(getTooltipContent(geo));
        }}
        onMouseLeave={() => {
          setTooltipContent('');
        }}
        onClick={() => {
          handleMapClick(geo);
        }}
        style={{
          default: {
            stroke: '#607D8B',
            strokeWidth: 0.25,
            outline: 'none',
          },
          hover: {
            stroke: '#607D8B',
            strokeWidth: 0.5,
            outline: 'none',
          },
          pressed: {
            stroke: '#607D8B',
            strokeWidth: 0.5,
            outline: 'none',
          },
        }}
      />
    );
  };

  const getTooltipContent = geo => {
    const geoStats = getGeoStats(geo, currentDate);
    return `${geoStats.geoName} (${currentDate})<br>
    Deaths: ${geoStats.deaths} (${geoStats.deathsPerM}/M)}<br>
    Confirmed: ${geoStats.confirmed}
    (${geoStats.confirmedPerM}/M)<br>
    Population: ${geoStats.population.toLocaleString()}`;
  };

  const handleMapClick = geo => {
    const newZoomState = {
      geoId: geo.id,
    };
    if (zoomState.zoom < 2) {
      // Do NOT zoom out if already zoomed in to county level
      newZoomState.zoom = 2;
      newZoomState.center = geoCentroid(geo);
    } else if (zoomState.zoom < 8) {
      newZoomState.zoom = 8;
      newZoomState.center = geoCentroid(geo);
    }
    onUpdateZoomState(newZoomState);
  };

  const formatGeoId = geoId => {
    if (geoId === undefined) {
      return '0';
    }
    if (geoId.length <= 2) {
      return `${geoId}`.padStart(2, '0');
    }
    if (geoId.length <= 5) {
      return `${geoId}`.padStart(5, '0');
    }
    // We really shouldn't be here. If we are here, something was wrong
    return geoId;
  };

  recalculateBounds(data);

  if (zoomLevelIsCountry(zoomState) && colorMapPerCapita) {
    caption = 'Per Million';
  } else {
    caption = '';
  }

  return (
    <div>
      <CenteredSection>
        <ReactTooltip html>{tooltipContent}</ReactTooltip>
        <Typography variant="h4">{caption}</Typography>
        <ComposableMap data-tip="" projection="geoAlbersUsa">
          <ZoomableGroup
            zoom={zoomState.zoom}
            center={zoomState.center}
            onMoveEnd={evt => {
              onUpdateZoomState({ zoom: evt.zoom, center: evt.coordinates });
            }}
          >
            <Geographies geography={zoomState.geoJsonUrl}>
              {({ geographies }) => (
                <>
                  {geographies.map(geo => getStateOrCountyGeography(geo))}
                  {geographies.map(geo => getStateMarkerAnnotation(geo))}
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </CenteredSection>
    </div>
  );
}

CovidMap.propTypes = {
  data: PropTypes.any,
  searchWith: PropTypes.string,
  colorMapBy: PropTypes.oneOf(['confirmed', 'deaths']),
  colorMapNewCases: PropTypes.bool,
  colorMapPerCapita: PropTypes.bool,
  zoomState: PropTypes.any,
  onUpdateZoomState: PropTypes.func,
};

export default CovidMap;
