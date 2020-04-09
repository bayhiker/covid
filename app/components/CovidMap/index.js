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

import { stateAbbreviations, zoomLevelIsCountry } from '../../utils/mapUtils';
import { CenteredSection } from '../../utils/styledUtil';
import { Typography } from '@material-ui/core';

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

function CovidMap({
  data,
  zoomState,
  searchWith,
  colorMapBy,
  colorMapPerCapita,
  onUpdateZoomState,
}) {
  const [tooltipContent, setTooltipContent] = React.useState('');
  let caption = '';
  const currentDate = data.most_recent_date;
  const { population, names } = data;
  let logCasesSpan = 24;
  let minLogCases = 0;
  let logPerCapitaSpan = 24;
  let minLogPerCapita = 0;

  React.useEffect(() => {
    recalculateBounds();
  }, [data]);

  const recalculateBounds = () => {
    if (!data || !data[colorMapBy]) {
      return;
    }
    const { minCases, maxCases, minPerCapita, maxPerCapita } = data[colorMapBy][
      data.most_recent_date
    ];
    minLogCases = minCases === 0 ? 0 : Math.log2(minCases);
    logCasesSpan = (maxCases === 0 ? 0 : Math.log2(maxCases)) - minLogCases;
    minLogPerCapita = minPerCapita === 0 ? 0 : Math.log2(minPerCapita);
    logPerCapitaSpan =
      (maxPerCapita === 0 ? 0 : Math.log2(maxPerCapita)) - minLogPerCapita;
  };

  const getScale = cases => {
    const lowerBound = colorMapPerCapita ? minLogPerCapita : minLogCases;
    const logSpan = colorMapPerCapita ? logPerCapitaSpan : logCasesSpan;
    if (cases < 1 || logCasesSpan === 0) {
      return 0;
    }
    return Math.floor(((Math.log2(cases) - lowerBound) / logSpan) * 10);
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

  const getStateMarkerAnnotation = geo => {
    if (!names || !population || !haveDataForGeo(geo)) {
      return false;
    }
    const fipsFormatted = formatGeoId(geo.id);
    const geoName = names[fipsFormatted];
    const pop = population[fipsFormatted];
    const confirmed = data.confirmed[currentDate][fipsFormatted];
    const confirmedPerM = Math.ceil((confirmed / pop) * 1000000);
    const deaths = data.deaths[currentDate][fipsFormatted];
    const deathsPerM = Math.ceil((deaths / pop) * 1000000);
    const centroid = geoCentroid(geo);
    const stateAbbreviation = stateAbbreviations[geo.id];
    let suffix = '';
    if (colorMapPerCapita) {
      suffix = `${colorMapBy === 'confirmed' ? confirmedPerM : deathsPerM}`;
    } else {
      suffix = `${
        colorMapBy === 'confirmed' ? Math.ceil(confirmed / 1000) : deaths
      }`;
    }
    const getGeoMarkerOrAnnotation = () =>
      geoName &&
      stateAbbreviation &&
      centroid[0] > -160 &&
      centroid[0] < -67 &&
      (stateAbbreviation in stateOffsets ? (
        <Annotation
          subject={centroid}
          dx={stateOffsets[stateAbbreviation][0]}
          dy={stateOffsets[stateAbbreviation][1]}
        >
          <text x={4} fontSize={14} alignmentBaseline="middle">
            {`${stateAbbreviation}(${suffix})`}
          </text>
        </Annotation>
      ) : (
        <Marker coordinates={centroid}>
          <text y="2" fontSize={14} textAnchor="middle">
            {`${stateAbbreviation}(${suffix})`}
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
        {zoomState.zoom > 2 ? '' : getGeoMarkerOrAnnotation(geo)}
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
      cases = data[colorMapBy][currentDate][fipsFormatted];
      if (colorMapPerCapita) {
        cases = (cases / population[fipsFormatted]) * 1000000000;
      }
    }
    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        fill={colorScale(cases !== undefined ? getScale(cases) : '#EEE')}
        onMouseEnter={() => {
          setTooltipContent(getTooltipContent(geo));
          onUpdateZoomState({
            geoId: fipsFormatted,
          });
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
    const fipsFormatted = formatGeoId(geo.id);
    const geoName = names[fipsFormatted];
    const pop = population[fipsFormatted];
    const confirmed = data.confirmed[currentDate][fipsFormatted];
    const confirmedPerM = Math.ceil((confirmed / pop) * 1000000);
    const deaths = data.deaths[currentDate][fipsFormatted];
    const deathsPerM = Math.ceil((deaths / pop) * 1000000);
    return `${geoName} (${currentDate})<br>
    Deaths: ${deaths} (${deathsPerM}/M)}<br>
    Confirmed: ${confirmed}
    (${confirmedPerM}/M)<br>
    Population: ${pop.toLocaleString()}`;
  };

  const handleMapClick = geo => {
    onUpdateZoomState({
      // Do NOT zoom out if already zoomed in to county level
      zoom: zoomState.zoom < 2 ? 2 : zoomState.zoom,
      center: geoCentroid(geo),
      geoId: geo.id,
    });
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

  if (zoomLevelIsCountry(zoomState)) {
    if (colorMapPerCapita) {
      caption = 'Per Million';
    } else if (colorMapBy === 'confirmed') {
      caption = 'In Thousands';
    }
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
  colorMapPerCapita: PropTypes.bool,
  zoomState: PropTypes.any,
  onUpdateZoomState: PropTypes.func,
};

export default CovidMap;
