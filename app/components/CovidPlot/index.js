/**
 *
 * CovidPlot
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const extractDataToPlot = (data, perCapita, dataToPlot) => {
  if (!data || !data.most_recent_date) {
    return;
  }
  const timeSeriesConfirmed = data.confirmed.time_series;
  const timeSeriesDeaths = data.deaths.time_series;
  const startDateParts = data.least_recent_date.split('/');
  const endDateParts = data.most_recent_date.split('/');
  const startDate = new Date(
    parseInt(`20${startDateParts[2]}`, 10),
    parseInt(startDateParts[0], 10),
    parseInt(startDateParts[1], 10),
  );
  const endDate = new Date(
    parseInt(`20${endDateParts[2]}`, 10),
    parseInt(endDateParts[0], 10),
    parseInt(endDateParts[1], 10),
  );
  let prevTotalDeaths = 0;
  let prevTotalConfirmed = 0;
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const seriesKey = `${d.getMonth()}/${d.getDate()}/${d.getYear() - 100}`;
    const totalConfirmed = timeSeriesConfirmed[seriesKey];
    const totalDeaths = timeSeriesDeaths[seriesKey];
    dataToPlot.push({
      name: `${d.getMonth()}/${d.getDate()}`,
      confirmed: totalConfirmed,
      deaths: totalDeaths,
      'new confirmed': totalConfirmed - prevTotalConfirmed,
      'new deaths': totalDeaths - prevTotalDeaths,
    });
    prevTotalConfirmed = timeSeriesConfirmed[seriesKey];
    prevTotalDeaths = timeSeriesDeaths[seriesKey];
  }
};

function CovidPlot({ data, perCapita }) {
  const dataToPlot = [];
  extractDataToPlot(data, perCapita, dataToPlot);
  return (
    <div>
      <LineChart width={1024} height={400} data={dataToPlot}>
        <Line type="monotone" dataKey="confirmed" stroke="#00F" />
        <Line type="monotone" dataKey="deaths" stroke="#000" />
        <Line type="monotone" dataKey="new deaths" stroke="#F00" />
        <Line type="monotone" dataKey="new confirmed" stroke="#0F0" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
      </LineChart>
    </div>
  );
}

CovidPlot.propTypes = {
  data: PropTypes.any,
  perCapita: PropTypes.bool,
};

export default CovidPlot;
