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
import { Injector } from '../common/di';
import { LocaleService } from '../services/locale/locale.service';
import { Skeleton } from '../skeleton';
import { LocaleType } from '../types/enum/locale-type';

describe('Skeleton', () => {
    it('updates dirty state and releases locale data on dispose', () => {
        const injector = new Injector([[LocaleService], [Skeleton]]);

        try {
            const localeService = injector.get(LocaleService);
            localeService.load({ [LocaleType.EN_US]: {} });
            localeService.setLocale(LocaleType.EN_US);
            localeService.setDirection('ltr');
            const skeleton = injector.get(Skeleton);

            expect(skeleton.dirty).toBe(true);
            skeleton.makeDirty(false);
            expect(skeleton.dirty).toBe(false);

            skeleton.dispose();
            expect(skeleton.getFontLocale()).toBeNull();
        } finally {
            injector.dispose();
        }
    });
});
