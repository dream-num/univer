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

import { localeTagPattern } from '../../types/locale-tag-pattern';

interface IRegionalRule<T> {
    value: T;
    territories?: string[];
    scripts?: string[];
}

// Excel resolves these older language names using the modern formatting data.
const languageAliases = new Map([['cmn', 'zh'], ['sh', 'sr'], ['tl', 'fil']]);

export function getRegionParts(region: string): { language: string; script: string; territory: string } | undefined {
    const parts = localeTagPattern.exec(region);
    // Excel uses default number settings for extended-language tags, including zh-cmn-Hans-DE.
    if (!parts || parts[1].includes('-')) return undefined;
    const inputLanguage = parts[1].toLowerCase();
    return {
        language: languageAliases.get(inputLanguage) ?? inputLanguage,
        script: parts[2]?.toLowerCase() ?? (inputLanguage === 'sh' ? 'latn' : ''),
        territory: parts[3]?.toUpperCase() ?? '',
    };
}

export class RegionRules<T> {
    private readonly _byLanguage = new Map<string, IRegionalRule<T>[]>();

    add(value: T, languages: string, territories?: string, scripts?: string): void {
        const rule = { value, territories: territories?.split(' '), scripts: scripts?.split(' ') };
        for (const language of languages.split(' ')) {
            const rules = this._byLanguage.get(language);
            if (rules) rules.push(rule);
            else this._byLanguage.set(language, [rule]);
        }
    }

    has(language: string): boolean {
        return this._byLanguage.has(language);
    }

    resolve(region: string): T | undefined {
        const parts = getRegionParts(region);
        if (!parts) return undefined;
        const { language, script, territory } = parts;
        return this._byLanguage.get(language)?.find((rule) =>
            (!rule.territories || rule.territories.includes(territory)) &&
            (!rule.scripts || (script && rule.scripts.includes(script)))
        )?.value;
    }
}
