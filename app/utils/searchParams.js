import { usStates } from './mapUtils';
/* eslint-disable no-param-reassign */
export function updateCovidState(covidState, urlSearchString) {
  const urlParams = new URLSearchParams(urlSearchString);
  const m = urlParams.get('m');
  const p = urlParams.get('p');
  if (m) {
    // Example search string: dnp-06, cnp-06028, dp
    const [mapFeatures, fips] = m.split('-', 2);
    if (mapFeatures.includes('c')) {
      covidState.colorMapBy = 'confirmed';
    }
    if (mapFeatures.includes('d')) {
      covidState.colorMapBy = 'deaths';
    }
    if (mapFeatures.includes('n')) {
      covidState.colorMapNewCases = true;
    }
    if (mapFeatures.includes('p')) {
      covidState.colorMapPerCapita = true;
    }
    if (fips && fips.length >= 2) {
      const newZoomState = {};
      newZoomState.geoId = fips;
      let stateFips = fips;
      if (fips.length > 2) {
        stateFips = fips.substring(0, 2);
      }
      if (stateFips in usStates) {
        newZoomState.center = [
          usStates[stateFips].lon,
          usStates[stateFips].lat,
        ];
        if (fips.length > 2) {
          newZoomState.zoom = 8;
        } else {
          newZoomState.zoom = 2;
        }
      }
      covidState.zoomState = newZoomState;
    }
  }
  if (p) {
    covidState.currentPlotTab = parseInt(p.match(/^\d+/).shift(), 10);
    if (covidState.currentPlotTab === 5) {
      let raceBy = '';
      if (p.includes('i')) raceBy = 'mobility';
      else if (p.includes('s')) raceBy = 'testing/settled_cases';
      else if (p.includes('r')) raceBy = 'testing/positive_rate';
      else {
        if (p.includes('m')) raceBy += 'confirmed';
        if (p.includes('d')) raceBy += 'deaths';
        if (p.includes('n')) raceBy += '-new';
        if (p.includes('p')) raceBy += '-per-capita';
      }
      covidState.raceChart = { raceBy };
    }
  }
}

export function getSearchString(covidState) {
  const urlSearchParams = new URLSearchParams();
  const geoId =
    covidState.zoomState.geoId !== '0' ? `-${covidState.zoomState.geoId}` : '';
  const map = `${covidState.colorMapBy === 'confirmed' ? 'c' : 'd'}${
    covidState.colorMapNewCases ? 'n' : ''
  }${covidState.colorMapPerCapita ? 'p' : ''}${geoId}`;
  urlSearchParams.append('m', map);
  let plot = `${covidState.currentPlotTab}`;
  if (plot === '5') {
    let compressedRaceBy = '';
    const { raceBy } = covidState.raceChart;
    if (raceBy === 'mobility') compressedRaceBy = 'i';
    else if (raceBy === 'testing/settled_cases') compressedRaceBy = 's';
    else if (raceBy === 'testing/positive_rate') compressedRaceBy = 'r';
    else {
      if (raceBy.includes('confirmed')) compressedRaceBy += 'c';
      if (raceBy.includes('deaths')) compressedRaceBy += 'd';
      if (raceBy.includes('-new')) compressedRaceBy += 'n';
      if (raceBy.includes('-per-capita')) compressedRaceBy += 'p';
    }
    plot += compressedRaceBy;
  }
  urlSearchParams.append('p', plot);
  return urlSearchParams.toString();
}
