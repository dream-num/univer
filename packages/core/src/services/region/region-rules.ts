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

import { getRegionTag } from '../../types/enum/locale-type';

interface IRegionalRule<T> {
    value: T;
    territories?: string[];
    scripts?: string[];
}

const regionTag = /^([a-z]{2,8})(?:-([a-z]{4}))?(?:-([a-z]{2}|[0-9]{3}))?(?:-(?:[a-z0-9]{5,8}|[0-9][a-z0-9]{3}))*(?:-[0-9a-wy-z](?:-[a-z0-9]{2,8})+)*(?:-x(?:-[a-z0-9]{1,8})+)?$/i;

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

    resolve(region: string): T | undefined {
        const parts = regionTag.exec(getRegionTag(region));
        if (!parts) return undefined;
        const script = parts[2]?.toLowerCase();
        const territory = parts[3]?.toUpperCase() ?? '';
        return this._byLanguage.get(parts[1].toLowerCase())?.find((rule) =>
            (!rule.territories || rule.territories.includes(territory)) &&
            (!rule.scripts || (script && rule.scripts.includes(script)))
        )?.value;
    }
}
