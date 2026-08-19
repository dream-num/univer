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

import { Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ParagraphSettingMenuFactory, SectionSettingMenuFactory } from '../context-menu';

describe('settings context menu factories', () => {
    it('does not show leading icons', () => {
        const accessor = new Injector([
            [DocSelectionManagerService, {
                useValue: {
                    textSelection$: of(null),
                    getActiveTextRange: () => null,
                },
            }],
            [IUniverInstanceService, {
                useValue: {
                    focused$: of('doc-1'),
                    getUnitType: () => UniverInstanceType.UNIVER_DOC,
                },
            }],
        ]);

        expect(ParagraphSettingMenuFactory(accessor).icon).toBeUndefined();
        expect(SectionSettingMenuFactory(accessor).icon).toBeUndefined();

        accessor.dispose();
    });
});
