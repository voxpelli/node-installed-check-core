import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getObjectValueByPath } from '@voxpelli/typed-utils';

/**
 * @param {string} content
 * @returns {string}
 */
function getIndent (content) {
  const indentMatch = content.match(/^[\t ]+/m);

  return indentMatch ? indentMatch[0] : '  ';
}

/**
 * @typedef Fix
 * @property {string} childKey
 * @property {string} suggested
 * @property {string} topKey
 */

/**
 * @param {string} cwd
 * @param {Fix[]} fixes
 * @returns {Promise<string[]>}
 */
export async function fixPkg (cwd, fixes) {
  /** @type {string[]} */
  const failures = [];

  if (fixes.length === 0) {
    return failures;
  }

  const pkgPath = path.join(cwd, 'package.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const raw = await readFile(pkgPath, { encoding: 'utf8' });

  const indent = getIndent(raw);

  const data = JSON.parse(raw);

  for (const { childKey, suggested, topKey } of fixes) {
    const collection = getObjectValueByPath(data, topKey, true);

    if (!collection) {
      failures.push(`Failed to fix "${topKey}.${childKey}". Not an object at "${topKey}".`);
      continue;
    } else if (childKey === '__proto__' || childKey === 'constructor' || childKey === 'prototype') {
      failures.push(`Do not include "${childKey}" in your path`);
      continue;
    }

    collection[childKey] = suggested;
  }

  const newRaw = JSON.stringify(data, undefined, indent) + '\n';

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(pkgPath, newRaw);

  return failures;
}
