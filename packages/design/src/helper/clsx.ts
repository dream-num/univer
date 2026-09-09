/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CLASS_CONFLICTS, CLASS_GROUPS, POSTFIX_CONFLICTS, VALIDATOR_NAMES } from './clsx.generated';

export type ClassValue = string | number | bigint | boolean | null | undefined | ClassValue[] | Record<string, unknown>;

interface IClassToken {
    id: number | string;
    conflicts: readonly (number | string)[];
}

const arbitraryValue = /^\[(?:([a-z-]+):)?(.+)\]$/i;
const lengthValue = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorValue = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;

function isNumber(value: string) {
    return Boolean(value) && !Number.isNaN(Number(value));
}

function isArbitrary(value: string, labels: string[], test: (value: string) => boolean = () => false) {
    const match = arbitraryValue.exec(value);
    return !!match && (match[1] ? labels.includes(match[1]) : test(match[2]));
}

// Tailwind v3 validators, adapted from tailwind-merge 2.6.0.
// Its MIT license is included with the generated rules in clsx.generated.ts.
const validators: Record<typeof VALIDATOR_NAMES[number], (value: string) => boolean> = {
    isAny: () => true,
    isArbitraryImage: (value) => isArbitrary(value, ['image', 'url'], (value) => /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/.test(value)),
    isArbitraryLength: (value) => isArbitrary(value, ['length'], (value) => lengthValue.test(value) && !colorValue.test(value)),
    isArbitraryNumber: (value) => isArbitrary(value, ['number'], isNumber),
    isArbitraryPosition: (value) => isArbitrary(value, ['position']),
    isArbitraryShadow: (value) => isArbitrary(value, [], (value) => /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/.test(value)),
    isArbitrarySize: (value) => isArbitrary(value, ['length', 'size', 'percentage']),
    isArbitraryValue: (value) => arbitraryValue.test(value),
    isInteger: (value) => Boolean(value) && Number.isInteger(Number(value)),
    isLength: (value) => isNumber(value) || ['px', 'full', 'screen'].includes(value) || /^\d+\/\d+$/.test(value),
    isNumber,
    isPercent: (value) => value.endsWith('%') && isNumber(value.slice(0, -1)),
    isTshirtSize: (value) => /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/.test(value),
};

const classValidators = VALIDATOR_NAMES.map((name) => validators[name]);
const classPatterns = new Map<string, number[]>();
const classGroups = new Map<string, number>();
const cache = new Map<string, string>();
const cacheKeys = cache.keys();
const tokens = new Map<string, IClassToken | null>();
const tokenKeys = tokens.keys();
const plainTokens: IClassToken[] = [];

CLASS_GROUPS.forEach((rules, index) => {
    for (const [prefix, literals, mask] of rules) {
        if (literals !== null) {
            for (const suffix of literals.split(' ')) {
                classGroups.set(prefix + (prefix && suffix ? '-' : '') + suffix, index + 1);
            }
        }
        if (mask) {
            const patterns = classPatterns.get(prefix) ?? [];
            patterns.push(index + 1, mask);
            classPatterns.set(prefix, patterns);
        }
    }
});

function getClassGroup(className: string): number | string | undefined {
    const positive = className.startsWith('-') ? className.slice(1) : className;
    if (!positive.startsWith('univer-')) {
        // Arbitrary properties are unprefixed in Tailwind v3, including in prefixed projects.
        const property = /^\[([^:]+):.+\]$/.exec(className);
        return property ? `arbitrary..${property[1]}` : undefined;
    }

    const utility = positive.slice(7);
    const exact = classGroups.get(utility);
    if (exact !== undefined) {
        return exact;
    }

    // Longest prefix first preserves v3's precedence (e.g. border-x width before border color).
    for (let end = utility.lastIndexOf('-'); end > 0; end = utility.lastIndexOf('-', end - 1)) {
        const rules = classPatterns.get(utility.slice(0, end));
        if (!rules) {
            continue;
        }

        const value = utility.slice(end + 1);
        for (let index = 0; index < rules.length; index += 2) {
            // Visit only the validators present in the precompiled bitmask.
            for (let mask = rules[index + 1]; mask; mask &= mask - 1) {
                const validator = 31 - Math.clz32(mask & -mask);
                if (classValidators[validator](value)) {
                    return rules[index];
                }
            }
        }
    }
}

function joinClasses(inputs: ClassValue[]): string {
    let result = '';
    for (const value of inputs) {
        if (!value) {
            continue;
        }

        let joined = '';
        if (typeof value === 'string' || typeof value === 'number') {
            joined = String(value);
        } else if (Array.isArray(value)) {
            joined = joinClasses(value);
        } else if (typeof value === 'object') {
            for (const key in value) {
                if (value[key]) {
                    result += (result ? ' ' : '') + key;
                }
            }
        }
        if (joined) {
            result += (result ? ' ' : '') + joined;
        }
    }
    return result;
}

function parseClassName(original: string) {
    const modifiers: string[] = [];
    let sortable: string[] = [];
    let depth = 0;
    let start = 0;
    let slash = -1;

    for (let position = 0; position < original.length; position++) {
        const character = original[position];
        if (depth === 0 && character === ':') {
            const modifier = original.slice(start, position);
            if (modifier.startsWith('[')) {
                modifiers.push(...sortable.sort(), modifier);
                sortable = [];
            } else {
                sortable.push(modifier);
            }
            start = position + 1;
        } else if (depth === 0 && character === '/') {
            slash = position;
        } else if (character === '[') {
            depth++;
        } else if (character === ']') {
            depth--;
        }
    }

    const important = original[start] === '!';
    if (important) {
        // Strip v3's leading ! before slicing / so text-sm/6 remains a font size, not a color.
        start++;
    }

    let hasPostfix = slash > start;
    let group = getClassGroup(original.slice(start, hasPostfix ? slash : undefined));
    if (group === undefined && hasPostfix) {
        group = getClassGroup(original.slice(start));
        hasPostfix = false;
    }

    modifiers.push(...sortable.sort());
    return { group, hasPostfix, scope: `${modifiers.join(':')}|${important ? '!' : ''}` };
}

function getClassToken(original: string): IClassToken | null {
    // Arbitrary values often change on every call; retaining them costs more than reusing their group.
    const cacheable = original.indexOf('[') === -1;
    if (cacheable) {
        const cached = tokens.get(original);
        if (cached !== undefined) {
            return cached;
        }
    }

    let group: number | string | undefined;
    let scope = '|';
    let hasPostfix = false;
    if (original.indexOf(':') === -1 && original.indexOf('/') === -1) {
        const important = original[0] === '!';
        group = getClassGroup(important ? original.slice(1) : original);
        scope = important ? '|!' : '|';
    } else {
        ({ group, scope, hasPostfix } = parseClassName(original));
    }

    const token = group === undefined ? null : createClassToken(group, scope, hasPostfix);
    if (cacheable) {
        if (tokens.size >= 2048) {
            tokens.delete(tokenKeys.next().value!);
        }
        tokens.set(original, token);
    }
    return token;
}

function createClassToken(group: number | string, scope: string, hasPostfix: boolean): IClassToken {
    const plain = scope === '|' || scope === '|!';
    const offset = scope === '|!' ? CLASS_GROUPS.length : 0;
    const id = plain && typeof group === 'number' ? group + offset : scope + group;
    const postfix = hasPostfix && typeof group === 'number' ? POSTFIX_CONFLICTS[group] : undefined;
    const cached = typeof id === 'number' && !postfix ? plainTokens[id] : undefined;
    if (cached) {
        return cached;
    }

    const conflicts = typeof group === 'number'
        ? [...(CLASS_CONFLICTS[group] ?? []), ...(postfix ?? [])].map((conflict) => plain ? conflict + offset : scope + conflict)
        : [];
    const token = { id, conflicts };
    if (typeof id === 'number' && !postfix) {
        plainTokens[id] = token;
    }
    return token;
}

/** Joins conditional classes and resolves Tailwind CSS v3 conflicts for the univer- prefix. */
export function clsx(...inputs: ClassValue[]): string {
    const classList = inputs.length === 1 && typeof inputs[0] === 'string' ? inputs[0] : joinClasses(inputs);
    const cached = cache.get(classList);
    if (cached !== undefined) {
        return cached;
    }

    const classes = classList.trim().split(/\s+/);
    const conflicts = new Set<number | string>();
    let result = '';

    for (let index = classes.length - 1; index >= 0; index--) {
        const original = classes[index];
        const token = getClassToken(original);
        if (token) {
            if (conflicts.has(token.id)) {
                continue;
            }
            conflicts.add(token.id);
            for (const conflict of token.conflicts) {
                conflicts.add(conflict);
            }
        }

        result = original + (result ? ` ${result}` : '');
    }

    if (cache.size >= 1000) {
        cache.delete(cacheKeys.next().value!);
    }
    cache.set(classList, result);
    return result;
}
