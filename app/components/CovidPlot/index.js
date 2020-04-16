/**
 *
 * CovidPlot
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  titleToDate,
  dateToTitle,
  dateToShortTitle,
} from '../../utils/dateUtils';
import {
  zoomLevelIsCounty,
  zoomLevelIsState,
  usStates,
} from '../../utils/mapUtils';
import { CenteredSection } from '../../utils/styledUtil';

function CovidPlot({ data, zoomState, perCapita }) {
  const dataToPlot = [];
  let caption = 'United States';

  const extractDataToPlot = () => {
    if (!data || !data.most_recent_date) {
      return;
    }
    const startDate = titleToDate(data.least_recent_date);
    const endDate = titleToDate(data.most_recent_date);

    const countyLevel = zoomLevelIsCounty(zoomState);
    const { geoId } = zoomState;

    if (countyLevel) {
      caption = `${data.names[geoId]} County`;
    } else if (zoomLevelIsState(zoomState)) {
      caption = usStates[geoId.substring(0, 2)].name;
    }

    const timeSeriesConfirmed = data.confirmed.time_series;
    const timeSeriesDeaths = data.deaths.time_series;
    const timeSeriesMobility = data.mobility.time_series;

    let prevTotalDeaths = 0;
    let prevTotalConfirmed = 0;
    let prevMobility = -1;
    let firstValidMobilityFound = false;
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const seriesKey = dateToTitle(d);
      const totalConfirmed = countyLevel
        ? data.confirmed[seriesKey][geoId]
        : timeSeriesConfirmed[seriesKey];
      const totalDeaths = countyLevel
        ? data.deaths[seriesKey][geoId]
        : timeSeriesDeaths[seriesKey];
      const mobility = countyLevel
        ? data.mobility[seriesKey][geoId]
        : timeSeriesMobility[seriesKey];
      const dataPoint = {
        name: dateToShortTitle(d),
        confirmed: totalConfirmed,
        deaths: totalDeaths,
        'new confirmed': totalConfirmed - prevTotalConfirmed,
        'new deaths': totalDeaths - prevTotalDeaths,
      };
      if (
        !firstValidMobilityFound &&
        prevMobility !== -1 &&
        prevMobility !== mobility
      ) {
        firstValidMobilityFound = true;
      }

      if (firstValidMobilityFound) {
        dataPoint.mobility = mobility;
      }
      dataToPlot.push(dataPoint);
      prevTotalConfirmed = totalConfirmed;
      prevTotalDeaths = totalDeaths;
      prevMobility = mobility;
    }
  };

  extractDataToPlot();

  return (
    <div>
      <CenteredSection>
        <Typography variant="h4">{caption}</Typography>
        <ResponsiveContainer
          width="100%"
          aspect={2.0 / 1.0}
          maxHeight={512}
          minWidth={200}
        >
          <LineChart data={dataToPlot}>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="confirmed"
              stroke="#00F"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="new confirmed"
              stroke="#0F0"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="deaths"
              stroke="#000"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="new deaths"
              stroke="#F00"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="mobility"
              stroke="#EE0"
            />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis
              yAxisId="left"
              label={{
                value: 'Cases',
                position: 'insideBottomLeft',
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: 'Mobility Index',
                position: 'insideBottomRight',
              }}
            />
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="top" align="center" />
          </LineChart>
        </ResponsiveContainer>
      </CenteredSection>
    </div>
  );
}

CovidPlot.propTypes = {
  data: PropTypes.any,
  zoomState: PropTypes.any,
  perCapita: PropTypes.bool,
};

export default CovidPlot;
