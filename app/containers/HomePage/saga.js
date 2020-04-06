/**
 * Gets the problems of the user from Github
 */

/**
 * Root saga manages watcher lifecycle
 */
export default function* problemsData() {
  // Watches for LOAD_PROBLEMS actions and calls getProblems when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
}
