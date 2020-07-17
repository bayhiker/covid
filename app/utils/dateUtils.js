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

export function newDateWithOffset(d, offset) {
  const newDate = new Date(d.getTime());
  newDate.setDate(newDate.getDate() + offset);
  return newDate;
}

export function prevDateTitle(dateTitle) {
  return dateToTitle(newDateWithOffset(titleToDate(dateTitle), -1));
}

export function nextDateTitle(dateTitle) {
  return dateToTitle(newDateWithOffset(titleToDate(dateTitle), 1));
}

export function getDaysApart(startDateTitle, endDateTitle) {
  const startDate = titleToDate(startDateTitle);
  const endDate = titleToDate(endDateTitle);
  return Math.ceil(
    Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}

// handler takes exactly one arg d of date type
export function loopThroughDates(startDate, endDate, handler) {
  if (startDate < endDate) {
    for (
      let d = new Date(startDate.getTime()); // new Date So we don't unintentionaly change startDate
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      handler(d);
    }
  } else {
    for (
      let d = new Date(startDate.getTime()); // new Date So we don't unintentionaly change startDate
      d >= endDate;
      d.setDate(d.getDate() - 1)
    ) {
      handler(d);
    }
  }
}
