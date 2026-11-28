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

import { describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { LocaleType } from '../../../types/enum/locale-type';
import { LocaleService } from '../../locale/locale.service';
import { RegionService } from '../region.service';

describe('RegionService', () => {
    it('follows locale until a region is explicitly set', () => {
        const injector = new Injector([[LocaleService], [RegionService]]);
        const localeService = injector.get(LocaleService);
        const regionService = injector.get(RegionService);

        expect(regionService.getCurrentRegion()).toBe(LocaleType.ZH_CN);

        const changes: string[] = [];
        const regions: string[] = [];
        localeService.localeChanged$.subscribe((locale) => changes.push(locale));
        regionService.currentRegion$.subscribe((region) => regions.push(region));

        expect(() => regionService.setRegion('en_US')).toThrow(RangeError);
        localeService.setLocale('enUS');
        expect(regionService.getCurrentRegion()).toBe(LocaleType.EN_US);

        regionService.setRegion('en-IN');
        localeService.setLocale(LocaleType.JA_JP);
        expect(regionService.getCurrentRegion()).toBe('en-IN');

        regionService.setRegion('sr-latn-rs');
        localeService.setLocale('es-419');
        expect(regionService.getExplicitRegion()).toBe('sr-Latn-RS');
        expect(localeService.getCurrentLocale()).toBe('es-419');
        expect(changes).toEqual(['en-US', 'ja-JP', 'es-419']);
        expect(regions).toEqual(['zh-CN', 'en-US', 'en-IN', 'sr-Latn-RS']);
        injector.dispose();
    });
});
