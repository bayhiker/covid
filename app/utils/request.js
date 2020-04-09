import fileDownload from 'js-file-download';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  return response.json();
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  console.log(`Checking status`);
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Use js-download-file to save data downloaded from a URL
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          A future for saving files
 */
function downloadFile(response, toFilename) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  return response.blob().then(blob => {
    return fileDownload(blob, toFilename);
  });
}

/**
 * Download file from a URL, returning a promise
 *
 * @param  {string} url       The URL we want to download from
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export function download(url, options) {
  let { toFilename } = options;
  if (toFilename === undefined) {
    toFilename = 'youquiz_downloaded';
  }
  return fetch(url, options)
    .then(checkStatus)
    .then(response => {
      return downloadFile(response, toFilename);
    });
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON);
}
