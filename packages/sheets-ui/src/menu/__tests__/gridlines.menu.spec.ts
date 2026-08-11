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

import {
    ICommandService,
    IContextService,
    Injector,
    IUniverInstanceService,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ToggleGridlinesMenuFactory } from '../gridlines.menu';

function createMenuAccessor(unitType: UniverInstanceType): Injector {
    return new Injector([
        [ICommandService, { useValue: {} }],
        [IUniverInstanceService, {
            useValue: {
                focused$: new Subject<string | null>(),
                getFocusedUnit: () => ({ getUnitId: () => 'unit-1' }),
                getCurrentUnitOfType: () => null,
                getCurrentTypeOfUnit$: () => of(null),
                getUnitType: () => unitType,
            },
        }],
        [UserManagerService, { useValue: { currentUser$: of(null) } }],
        [IContextService, { useValue: { subscribeContextValue$: () => of(false) } }],
    ]);
}

describe('gridlines menu visibility', () => {
    it.each([
        [UniverInstanceType.UNIVER_SHEET, false],
        [UniverInstanceType.UNIVER_SLIDE, true],
    ])('for focused unit type %s sets hidden to %s', (unitType, expectedHidden) => {
        const accessor = createMenuAccessor(unitType);
        const hiddenValues: boolean[] = [];
        const subscription = ToggleGridlinesMenuFactory(accessor).hidden$?.subscribe((hidden) => hiddenValues.push(hidden));

        expect(hiddenValues).toEqual([expectedHidden]);

        subscription?.unsubscribe();
        accessor.dispose();
    });
});
