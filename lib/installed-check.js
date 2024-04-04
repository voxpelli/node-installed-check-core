import { workspaceLookup } from 'list-installed';

import { performInstalledCheck } from './perform-installed-check.js';

/** @typedef {Omit<import('list-installed').WorkspaceLookupOptions, 'path'> & { cwd?: string|undefined }} LookupOptions */

export const ROOT = Symbol('workspace root');

/** @typedef {{ [workspace: string]: boolean; [ROOT]?: boolean; }} WorkspaceSuccess */

/**
 * @param {import('./perform-installed-check.js').InstalledChecks[]} checks
 * @param {LookupOptions} [lookupOptions]
 * @param {import('./perform-installed-check.js').InstalledCheckOptions} [options]
 * @returns {Promise<import('./perform-installed-check.js').InstalledCheckResult & { workspaceSuccess: WorkspaceSuccess }>}
 */
export async function installedCheck (checks, lookupOptions, options) {
  const { cwd = '.', ...lookupOptionsRest } = lookupOptions || {};

  /** @type {Map<string|ROOT, string[]>} */
  const errors = new Map();
  /** @type {Map<string|ROOT, string[]>} */
  const warnings = new Map();
  /** @type {Map<string|ROOT, string[]>} */
  const suggestions = new Map();
  /** @type {WorkspaceSuccess} */
  const workspaceSuccess = {};

  // TODO: Optionally use a readWorkspaces() + npm API lookup instead
  for await (const item of workspaceLookup({ ...lookupOptionsRest, path: cwd })) {
    const result = await performInstalledCheck(checks, item.pkg, item.installed, options);

    const key = 'workspace' in item ? item.workspace : ROOT;

    errors.set(key, result.errors);
    warnings.set(key, result.warnings);
    suggestions.set(key, result.suggestions);

    workspaceSuccess[key] = result.errors.length === 0;
  }

  return {
    errors: prefixNotes(errors, lookupOptions),
    warnings: prefixNotes(warnings, lookupOptions),
    suggestions: prefixNotes(suggestions, lookupOptions),
    workspaceSuccess,
  };
}

/**
 * @param {Map<string|ROOT, string[]>} notes
 * @param {LookupOptions} [lookupOptions]
 * @returns {string[]}
 */
function prefixNotes (notes, lookupOptions) {
  if (lookupOptions?.includeWorkspaceRoot !== false && notes.size === 1) {
    return [...notes.values()].flat();
  }
  return [...notes].flatMap(([key, items]) =>
    items.map(item => `${key === ROOT ? 'root' : key}: ${item}`)
  );
}
