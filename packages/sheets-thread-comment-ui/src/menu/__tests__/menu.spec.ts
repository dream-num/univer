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
    FOCUSING_COMMON_DRAWINGS,
    IContextService,
    Injector,
    IPermissionService,
    IUniverInstanceService,
    UserManagerService,
} from '@univerjs/core';
import { RangeProtectionRuleModel, SheetsSelectionsService, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { drawingCommentMenuFactory } from '../menu';

describe('drawingCommentMenuFactory', () => {
    it('stays enabled for a focused drawing until comment permission is denied', () => {
        const permissionValues$ = new BehaviorSubject([{ value: true }, { value: true }]);
        const workbook = {
            getUnitId: () => 'unit-1',
            activeSheet$: of({ getSheetId: () => 'sheet-1' }),
        };
        const injector = new Injector([
            [IContextService, {
                useValue: {
                    subscribeContextValue$: (key: string) => of(key === FOCUSING_COMMON_DRAWINGS),
                },
            }],
            [IPermissionService, {
                useValue: {
                    permissionPointUpdate$: new Subject(),
                    composePermission$: () => permissionValues$,
                },
            }],
            [IUniverInstanceService, {
                useValue: {
                    focused$: new Subject(),
                    getCurrentTypeOfUnit$: () => of(workbook),
                },
            }],
            [RangeProtectionRuleModel, { useValue: { getSubunitRuleList: () => [] } }],
            [SheetsSelectionsService, {
                useValue: {
                    selectionChanged$: new Subject(),
                    getWorkbookSelections: () => ({ getSelectionsOfWorksheet: () => [] }),
                },
            }],
            [UserManagerService, { useValue: { currentUser$: of(null) } }],
            [WorksheetProtectionRuleModel, { useValue: { getRule: () => null } }],
        ]);
        const disabledValues: boolean[] = [];
        const subscription = drawingCommentMenuFactory(injector).disabled$.subscribe((disabled) => {
            disabledValues.push(disabled);
        });

        expect(disabledValues).toEqual([false]);

        permissionValues$.next([{ value: false }, { value: true }]);

        expect(disabledValues).toEqual([false, true]);
        subscription.unsubscribe();
        injector.dispose();
    });
});
