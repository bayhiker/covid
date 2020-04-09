/**
 *
 * CovidPlot
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
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

const extractDataToPlot = (data, perCapita, dataToPlot) => {
  if (!data || !data.most_recent_date) {
    return;
  }
  const timeSeriesConfirmed = data.confirmed.time_series;
  const timeSeriesDeaths = data.deaths.time_series;
  const startDate = titleToDate(data.least_recent_date);
  const endDate = titleToDate(data.most_recent_date);
  let prevTotalDeaths = 0;
  let prevTotalConfirmed = 0;
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const seriesKey = dateToTitle(d);
    const totalConfirmed = timeSeriesConfirmed[seriesKey];
    const totalDeaths = timeSeriesDeaths[seriesKey];
    dataToPlot.push({
      name: dateToShortTitle(d),
      confirmed: totalConfirmed,
      deaths: totalDeaths,
      'new confirmed': totalConfirmed - prevTotalConfirmed,
      'new deaths': totalDeaths - prevTotalDeaths,
    });
    prevTotalConfirmed = timeSeriesConfirmed[seriesKey];
    prevTotalDeaths = timeSeriesDeaths[seriesKey];
  }
};

function CovidPlot({ data, zoomState, perCapita }) {
  const dataToPlot = [];
  extractDataToPlot(data, perCapita, dataToPlot);
  return (
    <div>
      <ResponsiveContainer
        width="100%"
        aspect={2.0 / 1.0}
        maxHeight={512}
        minWidth={200}
      >
        <LineChart data={dataToPlot}>
          <Line type="monotone" dataKey="confirmed" stroke="#00F" />
          <Line type="monotone" dataKey="new confirmed" stroke="#0F0" />
          <Line type="monotone" dataKey="deaths" stroke="#000" />
          <Line type="monotone" dataKey="new deaths" stroke="#F00" />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

CovidPlot.propTypes = {
  data: PropTypes.any,
  zoomState: PropTypes.any,
  perCapita: PropTypes.bool,
};

export default CovidPlot;
