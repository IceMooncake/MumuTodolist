function toDateObject(value) {
  if (value instanceof Date) return value;
  else {
    value = new Date(value);
    if (value instanceof Date) return value;
    else return null;
  }
}

function formatTime(date) {
  date = toDateObject(date);
  if (!date) return null;
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatDate(date) {
  date = toDateObject(date);
  if (!date) return null;
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  month = month.toString().padStart(2, '0');
  day = day.toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  formatTime,
  formatDate
};
