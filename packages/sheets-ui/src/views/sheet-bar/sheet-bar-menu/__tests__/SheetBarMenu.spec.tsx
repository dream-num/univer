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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { IUniverInstanceService, LocaleType, mergeWorksheetSnapshotWithDefault, SheetTypes, Univer, UniverInstanceType } from '@univerjs/core';
import { WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { ISheetBarService, SheetBarService } from '../../../../services/sheet-bar/sheet-bar.service';
import { SheetBarMenu } from '../SheetBarMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('SheetBarMenu worksheet lifecycle', () => {
    it('updates the mounted menu after remote model creation and removal without changing the active sheet', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} } });
        const injector = univer.__getInjector();
        injector.add([ISheetBarService, { useClass: SheetBarService }]);
        injector.add([WorksheetProtectionRuleModel]);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'menu-book',
            sheetOrder: ['grid'],
            sheets: { grid: { id: 'grid', name: 'Grid' } },
        });
        injector.get(IUniverInstanceService).focusUnit('menu-book');
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        try {
            await act(async () => root.render(<RediContext value={{ injector }}><SheetBarMenu /></RediContext>));
            await act(async () => injector.get(ISheetBarService).triggerSheetBarMenu());
            expect(document.querySelector('[role=menu]')?.textContent).toContain('Grid');
            await act(async () => {
                workbook.addWorksheet('remote', 1, mergeWorksheetSnapshotWithDefault({ id: 'remote', name: 'Remote Charts', type: SheetTypes.CHART }));
            });
            expect(document.querySelector('[role=menu]')?.textContent).toContain('Remote Charts');
            await act(async () => {
                workbook.removeSheet('remote');
            });
            expect(document.querySelector('[role=menu]')?.textContent).not.toContain('Remote Charts');
            expect(workbook.getActiveSheet()?.getSheetId()).toBe('grid');
        } finally {
            await act(async () => root.unmount());
            container.remove();
            univer.dispose();
        }
    });
});
