/**
 * @param {unknown} obj
 * @param {string} path
 * @returns {string|undefined|false}
 */
export function getStringValueByPath (obj, path) {
  let currentValue = obj;

  for (const key of path.split('.')) {
    if (!currentValue || typeof currentValue !== 'object') {
      return;
    }

    currentValue = currentValue[/** @type {keyof typeof currentValue} */ (key)];
  }

  return currentValue === undefined
    ? undefined
    : (typeof currentValue === 'string' ? currentValue : false);
}
