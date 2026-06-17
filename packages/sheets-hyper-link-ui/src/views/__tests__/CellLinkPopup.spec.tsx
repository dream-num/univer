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

import type { ICustomRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import {
    CellValueType,
    CustomRangeType,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import {
    AddHyperLinkMutation,
    CancelHyperLinkCommand,
    HyperLinkModel,
    RemoveHyperLinkMutation,
    SheetsHyperLinkParserService,
    UpdateHyperLinkMutation,
} from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IMessageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { OpenHyperLinkEditPanelOperation } from '../../commands/operations/popup.operations';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { CellLinkPopupPure } from '../CellLinkPopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'sheet-link-popup-workbook';
const SUB_UNIT_ID = 'sheet-1';

class TestCanvasPopManagerService {
    attachPopupToCell() {
        return toDisposable(() => undefined);
    }

    attachPopupByPosition() {
        return toDisposable(() => undefined);
    }

    attachPopupToAbsolutePosition() {
        return toDisposable(() => undefined);
    }
}

class TestRenderManagerService {
    getRenderById() {
        return undefined;
    }
}

class TestEditorBridgeService {
    getCurrentEditorId() {
        return 'sheet-popup-editor';
    }

    isVisible() {
        return { visible: false };
    }

    getEditCellState() {
        return null;
    }
}

class TestDefinedNamesService {
    getValueById() {
        return undefined;
    }

    getWorksheetByRef() {
        return undefined;
    }

    focusRange() {
        // Defined-name navigation is outside these popup component scenarios.
    }
}

class TestMessageService {
    readonly messages: unknown[] = [];

    show(message: unknown) {
        this.messages.push(message);
    }
}

function createCellDocument(text: string, range: ICustomRange) {
    return {
        id: `${range.rangeId}-doc`,
        documentStyle: {
            pageSize: { width: 100, height: 40 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
        body: {
            dataStream: `${text}\r\n`,
            customRanges: [range],
        },
    };
}

function createWorkbookData(customRange: ICustomRange): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        name: 'hyperlink popup workbook',
        locale: LocaleType.EN_US,
        sheetOrder: [SUB_UNIT_ID],
        styles: {},
        sheets: {
            [SUB_UNIT_ID]: {
                id: SUB_UNIT_ID,
                name: 'Sheet 1',
                cellData: {
                    0: {
                        0: {
                            p: createCellDocument('Univer', customRange),
                            t: CellValueType.STRING,
                        },
                    },
                },
            },
        },
    };
}

function createHyperLinkRange(): ICustomRange {
    return {
        rangeId: 'link-range',
        rangeType: CustomRangeType.HYPERLINK,
        startIndex: 0,
        endIndex: 5,
        properties: {
            url: 'https://univer.ai',
        },
    };
}

function createPopupTestBed() {
    const customRange = createHyperLinkRange();
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([SheetInterceptorService]);
    injector.add([HyperLinkModel]);
    injector.add([DocSelectionManagerService]);
    injector.add([IDefinedNamesService, { useClass: TestDefinedNamesService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IMessageService, { useClass: TestMessageService as never }]);
    injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
    injector.add([SheetCanvasPopManagerService, { useClass: TestCanvasPopManagerService as never }]);
    injector.add([SheetsHyperLinkParserService]);
    injector.add([SheetsHyperLinkResolverService]);
    injector.add([SheetsHyperLinkPopupService]);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData(customRange));
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-hyper-link-ui': {
                popup: {
                    edit: 'Edit',
                    cancel: 'Remove link',
                },
                message: {
                    coped: 'Copied',
                },
            },
            'sheets-hyper-link': {
                message: {
                    refError: 'Invalid reference',
                },
            },
        },
    });

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(SetRangeValuesMutation);
    commandService.registerCommand(AddHyperLinkMutation);
    commandService.registerCommand(UpdateHyperLinkMutation);
    commandService.registerCommand(RemoveHyperLinkMutation);
    commandService.registerCommand(CancelHyperLinkCommand);
    commandService.registerCommand(OpenHyperLinkEditPanelOperation);

    return {
        univer,
        injector,
        commandService,
        workbook,
        customRange,
    };
}

function renderPopup(
    root: Root,
    container: HTMLDivElement,
    testBed: ReturnType<typeof createPopupTestBed>
) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <CellLinkPopupPure
                    unitId={UNIT_ID}
                    subUnitId={SUB_UNIT_ID}
                    row={0}
                    col={0}
                    customRange={testBed.customRange}
                    type={HyperLinkEditSourceType.VIEWING}
                    editPermission
                    copyPermission={false}
                />
            </RediContext.Provider>
        );
    });

    const actions = Array.from(container.querySelectorAll('.univer-ml-2')) as HTMLElement[];

    return {
        edit: actions[0],
        remove: actions[1],
    };
}

describe('CellLinkPopupPure', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPopupTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('opens the edit panel for the selected sheet hyperlink range', async () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const executedCommands: Array<{ id: string; params: unknown }> = [];
        currentTestBed.commandService.onCommandExecuted((command) => {
            executedCommands.push({ id: command.id, params: command.params });
        });
        const actions = renderPopup(root, container, currentTestBed);

        await act(async () => {
            actions.edit.click();
            await Promise.resolve();
        });

        expect(executedCommands).toContainEqual({
            id: OpenHyperLinkEditPanelOperation.id,
            params: {
                unitId: UNIT_ID,
                subUnitId: SUB_UNIT_ID,
                row: 0,
                col: 0,
                customRangeId: 'link-range',
                type: HyperLinkEditSourceType.VIEWING,
            },
        });
    });

    it('removes the hyperlink custom range from the sheet cell', () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const actions = renderPopup(root, container, currentTestBed);

        act(() => {
            actions.remove.click();
        });

        const cell = currentTestBed.workbook.getSheetBySheetId(SUB_UNIT_ID)?.getCellRaw(0, 0);

        expect(cell?.p?.body?.customRanges?.some((range) => range.rangeId === 'link-range')).toBe(false);
        expect(cell?.p?.body?.dataStream).toBe('Univer\r\n');
    });
});
