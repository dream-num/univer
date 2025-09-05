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

import type { Univer } from '@univerjs/core';
import type { FUniver, IEventBase } from '@univerjs/core/facade';
import type { IRemoveColByRangeCommandParams } from '@univerjs/sheets';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { CanceledError, ICommandService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RemoveColByRangeCommand } from '@univerjs/sheets';
import { SHEET_VIEW_KEY } from '@univerjs/sheets-ui';
import { IContextMenuService } from '@univerjs/ui';

interface IMainRightClickEventParams extends IEventBase {
    event: MouseEvent;
    row?: number;
    column?: number;
}

interface IRemoveColumnEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    startColumn: number;
    endColumn: number;
}

interface IBeforeRemoveColumnEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    startColumn: number;
    endColumn: number;
}

interface ICustomEventParamConfig {
    MainRightClickEvent: IMainRightClickEventParams;
    RemoveColumnEvent: IRemoveColumnEventParams;
    BeforeRemoveColumnEvent: IBeforeRemoveColumnEventParams;
}

export function customRegisterEvent(univer: Univer, univerAPI: FUniver) {
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
        if (stage === univerAPI.Enum.LifecycleStages.Steady) {
            registerMainRightClickEvent(univer, univerAPI);
            registerRemoveColumnEvent(univer, univerAPI);
            registerBeforeRemoveColumnEvent(univer, univerAPI);

            univerAPI.addEvent('MainRightClickEvent', (params) => {
                const { row, column } = params;
                console.warn(`Right clicked on cell at ${univerAPI.Util.tools.chatAtABC(column as number)}${row as number + 1}`);
                // If the cell is A1, do not show the context menu
                if (row === 0 && column === 0) {
                    params.cancel = true;
                }
            });

            univerAPI.addEvent('RemoveColumnEvent', (params) => {
                const { startColumn, endColumn } = params;
                console.warn(`Removed columns from ${univerAPI.Util.tools.chatAtABC(startColumn)} to ${univerAPI.Util.tools.chatAtABC(endColumn)}`);
            });

            const beforeRemoveColumnEventDisposable = univerAPI.addEvent('BeforeRemoveColumnEvent', (params) => {
                const { startColumn, endColumn } = params;
                console.warn(`Before removing columns from ${univerAPI.Util.tools.chatAtABC(startColumn)} to ${univerAPI.Util.tools.chatAtABC(endColumn)}`);
                // If the column to be deleted includes column C to E, prevent the deletion
                if (!(startColumn > 4 || endColumn < 2)) {
                    params.cancel = true;
                    console.warn('Cannot delete column C to E');
                }
            });

            // Remove the BeforeRemoveColumnEvent listener after 10 seconds
            setTimeout(() => {
                beforeRemoveColumnEventDisposable.dispose();
                console.warn('BeforeRemoveColumnEvent listener has been removed, you can delete any columns now.');
            }, 10000);
        }
    });
}

function registerMainRightClickEvent(univer: Univer, univerAPI: FUniver) {
    const fWorkbook = univerAPI.getActiveWorkbook();
    if (!fWorkbook) return;

    const fWorksheet = fWorkbook.getActiveSheet();
    if (!fWorksheet) return;

    const injector = univer.__getInjector();
    const renderManagerService = injector.get(IRenderManagerService);
    const render = renderManagerService.getRenderById(fWorkbook.getId());
    if (!render) return;

    const { components } = render;
    const mainComponent = components.get(SHEET_VIEW_KEY.MAIN);
    if (!mainComponent) return;

    const contextMenuService = injector.get(IContextMenuService);

    univerAPI.registerEventHandler(
        'MainRightClickEvent',
        () => mainComponent.onPointerDown$.subscribeEvent((event) => {
            if (event.button !== 2) return;

            const activeRange = fWorksheet.getActiveRange();
            const eventParams: IMainRightClickEventParams = {
                event,
                row: activeRange?.getRow() ?? 0,
                column: activeRange?.getColumn() ?? 0,
            };

            univerAPI.fireEvent('MainRightClickEvent', eventParams);

            if (eventParams.cancel) {
                requestAnimationFrame(() => {
                    contextMenuService.hideContextMenu();
                });
            }
        })
    );
}

function registerRemoveColumnEvent(univer: Univer, univerAPI: FUniver) {
    const injector = univer.__getInjector();
    const commandService = injector.get(ICommandService);

    univerAPI.registerEventHandler(
        'RemoveColumnEvent',
        () => commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id !== RemoveColByRangeCommand.id) return;

            const target = univerAPI.getCommandSheetTarget(commandInfo);
            if (!target) return;

            const { range } = commandInfo.params as IRemoveColByRangeCommandParams;
            const eventParams: IRemoveColumnEventParams = {
                workbook: target.workbook,
                worksheet: target.worksheet,
                startColumn: range.startColumn,
                endColumn: range.endColumn,
            };

            univerAPI.fireEvent('RemoveColumnEvent', eventParams);
        })
    );
}

function registerBeforeRemoveColumnEvent(univer: Univer, univerAPI: FUniver) {
    const injector = univer.__getInjector();
    const commandService = injector.get(ICommandService);

    univerAPI.registerEventHandler(
        'BeforeRemoveColumnEvent',
        () => commandService.beforeCommandExecuted((commandInfo) => {
            if (commandInfo.id !== RemoveColByRangeCommand.id) return;

            const target = univerAPI.getCommandSheetTarget(commandInfo);
            if (!target) return;

            const { range } = commandInfo.params as IRemoveColByRangeCommandParams;
            const eventParams: IBeforeRemoveColumnEventParams = {
                workbook: target.workbook,
                worksheet: target.worksheet,
                startColumn: range.startColumn,
                endColumn: range.endColumn,
            };

            univerAPI.fireEvent('BeforeRemoveColumnEvent', eventParams);

            if (eventParams.cancel) {
                throw new CanceledError();
            }
        })
    );
}

declare module '@univerjs/core/facade' {
    interface IEventParamConfig extends ICustomEventParamConfig { }
}
