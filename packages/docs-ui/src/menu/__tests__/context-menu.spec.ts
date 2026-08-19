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
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ParagraphSettingMenuFactory } from '../context-menu';

describe('ParagraphSettingMenuFactory', () => {
    it('does not show a leading icon in the context menu', () => {
        const accessor = new Injector([
            [IUniverInstanceService, {
                useValue: {
                    focused$: of('doc-1'),
                    getUnitType: () => UniverInstanceType.UNIVER_DOC,
                },
            }],
        ]);

        expect(ParagraphSettingMenuFactory(accessor).icon).toBeUndefined();

        accessor.dispose();
    });
});
