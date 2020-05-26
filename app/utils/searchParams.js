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
    covidState.currentPlotTab = parseInt(p, 10);
  }
}

export function getSearchString(covidState) {
  const urlSearchParams = new URLSearchParams();
  const geoId =
    covidState.zoomState.geoId !== '0' ? `-${covidState.zoomState.geoId}` : '';
  const map = `${covidState.colorMapBy === 'confirmed' ? 'c' : 'd'}${
    covidState.colorMapNewCases ? 'n' : ''
  }${covidState.colorMapPerCapita ? 'p' : ''}${geoId}`;
  const plot = `${covidState.currentPlotTab}`;
  urlSearchParams.append('m', map);
  urlSearchParams.append('p', plot);
  return urlSearchParams.toString();
}
