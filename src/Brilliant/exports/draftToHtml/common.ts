export function forListEach(obj, callback) {
  if (obj) {
    for (const key in obj) {
      if ({}.hasOwnProperty.call(obj, key)) {
        callback(key, obj[key]);
      }
    }
  }
}

export function isEmptyString(str) {
  if (
    str === undefined ||
    str === null ||
    str.length === 0 ||
    str.trim().length === 0
  ) {
    return true;
  }
  return false;
}
