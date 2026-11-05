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
    Univer,
    UserManagerService,
} from '@univerjs/core';
import { RangeProtectionRuleModel, SheetsSelectionsService, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { BehaviorSubject, firstValueFrom, of, Subject } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { SHEETS_THREAD_COMMENT_PANEL } from '../../types/const';
import { drawingCommentMenuFactory, threadCommentMenuFactory, threadPanelMenuFactory } from '../menu';

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

describe('thread comment menu', () => {
    it('shows the add comment label in its tooltip', () => {
        const service = {
            currentUser$: of(null),
            focused$: of(null),
            getCurrentTypeOfUnit$: () => of(null),
            subscribeContextValue$: () => of(false),
        };
        const accessor = new Injector([
            [IContextService, { useValue: service }],
            [IUniverInstanceService, { useValue: service }],
            [UserManagerService, { useValue: service }],
        ]);

        expect(threadCommentMenuFactory(accessor)).toMatchObject({
            title: 'sheets-thread-comment-ui.menu.addComment',
            tooltip: 'sheets-thread-comment-ui.menu.addComment',
        });

        accessor.dispose();
    });
});

describe('threadPanelMenuFactory activation', () => {
    it('tracks opening, replacement, closing, and late subscribers', async () => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);

        const sidebar = injector.get(ISidebarService);
        const menu = threadPanelMenuFactory(injector);
        let activated: boolean | undefined;
        const subscription = menu.activated$?.subscribe((value) => {
            activated = value;
        });
        onTestFinished(() => subscription?.unsubscribe());
        expect(activated).toBe(false);

        sidebar.open({ children: { label: SHEETS_THREAD_COMMENT_PANEL } });
        expect(activated).toBe(true);
        expect(await firstValueFrom(menu.activated$!)).toBe(true);

        sidebar.open({ id: 'another-panel', children: { label: 'another-panel' } });
        expect(activated).toBe(false);

        sidebar.open({ children: { label: SHEETS_THREAD_COMMENT_PANEL } });
        sidebar.close();
        expect(activated).toBe(false);
    });
});
