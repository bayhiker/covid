export function dateToTitle(d) {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getYear() - 100}`;
}

export function dateToShortTitle(d) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function titleToDate(t) {
  const dateParts = t.split('/');
  return new Date(
    parseInt(`20${dateParts[2]}`, 10),
    parseInt(dateParts[0], 10) - 1,
    parseInt(dateParts[1], 10),
  );
}

export function prevDateTitle(dateTitle) {
  const yesterday = new Date();
  yesterday.setDate(titleToDate(dateTitle).getDate() - 1);
  return dateToTitle(yesterday);
}

export function nextDateTitle(dateTitle) {
  const tomorrow = new Date();
  tomorrow.setDate(titleToDate(dateTitle).getDate() + 1);
  return dateToTitle(tomorrow);
}
