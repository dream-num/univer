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
import { LocaleType } from '../../../types/enum/locale-type';
import { LocaleService } from '../../locale/locale.service';
import { RegionService } from '../region.service';

describe('RegionService', () => {
    it('follows locale until a region is explicitly set', () => {
        const localeService = new LocaleService();
        const regionService = new RegionService(localeService);

        expect(regionService.getCurrentRegion()).toBe(LocaleType.ZH_CN);

        localeService.setLocale(LocaleType.EN_US);
        expect(regionService.getCurrentRegion()).toBe(LocaleType.EN_US);

        regionService.setRegion(LocaleType.FR_FR);
        localeService.setLocale(LocaleType.JA_JP);
        expect(regionService.getCurrentRegion()).toBe(LocaleType.FR_FR);

        regionService.dispose();
        localeService.dispose();
    });
});
