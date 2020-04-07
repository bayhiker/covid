/**
 *
 * CovidMap
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { geoCentroid } from 'd3';
import ReactTooltip from 'react-tooltip';

import states from '../../utils/data/states.json';

const geoCountiesUrl =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';
const geoStatesUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

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

const offsets = {
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

function CovidMap({ data, searchWith, colorMapBy, colorMapPerCapita }) {
  const [tooltipContent, setTooltipContent] = React.useState('');
  let logCasesSpan = 24;
  let minLogCases = 0;
  let logPerCapitaSpan = 24;
  let minLogPerCapita = 0;
  let population = {};

  React.useEffect(() => {
    recalculateBounds();
  }, [data]);

  const recalculateBounds = () => {
    if (!data || !data[colorMapBy]) {
      return;
    }
    // eslint-disable-next-line prefer-destructuring
    population = data.population;
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

  recalculateBounds(data);

  return (
    <>
      <ReactTooltip html>{tooltipContent}</ReactTooltip>
      <ComposableMap data-tip="" projection="geoAlbersUsa">
        <Geographies geography={geoStatesUrl}>
          {({ geographies }) => (
            <>
              {geographies.map(geo => {
                let cases = 0;
                const currentDate = data.most_recent_date;
                const fipsFormatted = `${geo.id}`.padStart(2, '0');
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
                    fill={colorScale(
                      cases !== undefined ? getScale(cases) : '#EEE',
                    )}
                    onMouseEnter={() => {
                      const pop = population[fipsFormatted];
                      const confirmed =
                        data.confirmed[currentDate][fipsFormatted];
                      const confirmedPerM = Math.ceil(
                        (confirmed / pop) * 1000000,
                      );
                      const deaths = data.deaths[currentDate][fipsFormatted];
                      const deathsPerM = Math.ceil((deaths / pop) * 1000000);
                      setTooltipContent(
                        `${states[geo.id].name} (${currentDate})<br>
                        Deaths: ${deaths} (${deathsPerM}/M)}<br>
                        Confirmed: ${confirmed} (${confirmedPerM}/M)<br>
                        Population: ${pop.toLocaleString()}`,
                      );
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('');
                    }}
                  />
                );
              })}
              {geographies.map(geo => {
                const centroid = geoCentroid(geo);
                const cur = states[geo.id];
                return (
                  <g key={`${geo.rsmKey}-name`}>
                    {cur &&
                      centroid[0] > -160 &&
                      centroid[0] < -67 &&
                      (Object.keys(offsets).indexOf(cur.abbreviation) === -1 ? (
                        <Marker coordinates={centroid}>
                          <text y="2" fontSize={14} textAnchor="middle">
                            {cur.abbreviation}
                          </text>
                        </Marker>
                      ) : (
                        <Annotation
                          subject={centroid}
                          dx={offsets[cur.abbreviation][0]}
                          dy={offsets[cur.abbreviation][1]}
                        >
                          <text x={4} fontSize={14} alignmentBaseline="middle">
                            {cur.abbreviation}
                          </text>
                        </Annotation>
                      ))}
                  </g>
                );
              })}
            </>
          )}
        </Geographies>
      </ComposableMap>
    </>
  );
}

CovidMap.propTypes = {
  data: PropTypes.any,
  searchWith: PropTypes.string,
  colorMapBy: PropTypes.oneOf(['confirmed', 'deaths']),
  colorMapPerCapita: PropTypes.bool,
};

export default CovidMap;
