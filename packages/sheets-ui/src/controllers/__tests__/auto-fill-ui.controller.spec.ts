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

import type { ICommandInfo, IDisposable } from '@univerjs/core';
import { ICommandService, Injector, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import { AutoFillController, IAutoFillService } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { SheetCanvasPopManagerService } from '../../services/canvas-pop-manager.service';
import { SheetsRenderService } from '../../services/sheets-render.service';
import { AUTO_FILL_POPUP_MENU_COMPONENT } from '../../views/auto-fill-popup-menu/component-name';
import { AutoFillUIController } from '../auto-fill-ui.controller';

describe('AutoFillUIController', () => {
    it('attaches the menu to the filled range and owns its lifecycle', () => {
        let commandExecuted: ((command: ICommandInfo) => void) | undefined;
        const showMenu$ = new BehaviorSubject(false);
        const firstPopupDisposable = { dispose: vi.fn() };
        const secondPopupDisposable = { dispose: vi.fn() };
        const thirdPopupDisposable = { dispose: vi.fn() };
        const attachRangePopup = vi.fn()
            .mockReturnValueOnce(firstPopupDisposable)
            .mockReturnValueOnce(secondPopupDisposable)
            .mockReturnValueOnce(thirdPopupDisposable);
        const quit = vi.fn();
        const autoFillService = {
            addHook: () => ({ dispose: () => undefined }),
            autoFillLocation: {
                source: { rows: [1, 2], cols: [3, 4] },
                target: { rows: [3, 4], cols: [3, 4] },
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
            },
            setShowMenu: (show: boolean) => showMenu$.next(show),
            showMenu$,
        };
        const injector = new Injector([
            [ICommandService, {
                useValue: {
                    onCommandExecuted: (callback: (command: ICommandInfo) => void): IDisposable => {
                        commandExecuted = callback;
                        return { dispose: () => undefined };
                    },
                },
            }],
            [IUniverInstanceService, { useValue: { unitDisposed$: new Subject() } }],
            [IAutoFillService, { useValue: autoFillService }],
            [AutoFillController, { useValue: { quit } }],
            [SheetsRenderService, {
                useValue: {
                    registerSkeletonChangingMutations: () => ({ dispose: () => undefined }),
                },
            }],
            [SheetCanvasPopManagerService, { useValue: { attachRangePopup } }],
            [AutoFillUIController],
        ]);
        const controller = injector.get(AutoFillUIController);

        autoFillService.setShowMenu(true);

        expect(attachRangePopup).toHaveBeenLastCalledWith(
            { startRow: 1, endRow: 4, startColumn: 3, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
            {
                componentKey: AUTO_FILL_POPUP_MENU_COMPONENT,
                constrainToCanvas: true,
                direction: 'bottom-right',
                offset: [2, 2],
            },
            'unit-1',
            'sheet-1'
        );

        commandExecuted?.({ id: SetScrollOperation.id, type: SetScrollOperation.type, params: {} });
        expect(firstPopupDisposable.dispose).not.toHaveBeenCalled();
        expect(quit).not.toHaveBeenCalled();

        autoFillService.setShowMenu(true);
        expect(firstPopupDisposable.dispose).toHaveBeenCalledTimes(1);

        autoFillService.setShowMenu(false);
        expect(secondPopupDisposable.dispose).toHaveBeenCalledTimes(1);

        autoFillService.setShowMenu(true);
        controller.dispose();
        expect(thirdPopupDisposable.dispose).toHaveBeenCalledTimes(1);
    });
});
