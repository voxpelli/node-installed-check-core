/**
 * @param {unknown} obj
 * @param {string} path
 * @returns {string|undefined|false}
 */
export function getStringValueByPath (obj, path) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const pathKeys = path.split('.');
  const stringKey = pathKeys.pop();

  if (!stringKey) {
    return;
  }

  const objectValue = pathKeys.length
    ? getObjectValueByPath(obj, pathKeys.join('.'))
    : /** @type {Record<string, unknown>} */ (obj);

  if (!objectValue) {
    return objectValue;
  }

  const value = objectValue[stringKey];

  return value === undefined
    ? undefined
    : (typeof value === 'string' ? value : false);
}

/**
 * @overload
 * @param {unknown} obj
 * @param {string} path
 * @param {false} [createIfMissing]
 * @returns {Record<string, unknown>|undefined|false}
 */
/**
 * @overload
 * @param {unknown} obj
 * @param {string} path
 * @param {true} createIfMissing
 * @returns {Record<string, unknown>|false}
 */
/**
 * @param {unknown} obj
 * @param {string} path
 * @param {boolean} [createIfMissing]
 * @returns {Record<string, unknown>|undefined|false}
 */
export function getObjectValueByPath (obj, path, createIfMissing) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  let currentValue = /** @type {Record<string, unknown>} */ (obj);

  for (const key of path.split('.')) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      throw new Error(`Do not include "${key}" in your path`);
    }

    const nextValue = currentValue[key];

    if (nextValue === undefined) {
      if (!createIfMissing) {
        return;
      }
      /** @type {Record<string, unknown>} */
      const newValue = {};
      currentValue[key] = newValue;
      currentValue = newValue;
    } else if (nextValue && typeof nextValue === 'object') {
      currentValue = /** @type {Record<string, unknown>} */ (nextValue);
    } else {
      return false;
    }
  }

  return currentValue === undefined
    ? undefined
    : (currentValue && typeof currentValue === 'object' ? currentValue : false);
}
