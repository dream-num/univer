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
import {
    SetRangeValuesMutation,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    AddHyperLinkCommand,
    AddHyperLinkMutation,
    CancelHyperLinkCommand,
    HyperLinkModel,
    RemoveHyperLinkMutation,
    SheetHyperLinkType,
    SheetsHyperLinkParserService,
    UpdateHyperLinkMutation,
} from '@univerjs/sheets-hyper-link';
import {
    IEditorBridgeService,
    IMarkSelectionService,
    ScrollToRangeOperation,
    SheetCanvasPopManagerService,
} from '@univerjs/sheets-ui';
import { IMessageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { CloseHyperLinkPopupOperation, OpenHyperLinkEditPanelOperation } from '../../commands/operations/popup.operations';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { SheetsHyperLinkSidePanelService } from '../../services/side-panel.service';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { CellLinkEdit } from '../CellLinkEdit';
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
    enableScrollRender = false;
    readonly scrollRanges: unknown[] = [];

    getRenderById(id: string) {
        if (id !== UNIT_ID || !this.enableScrollRender) {
            return undefined;
        }

        return {
            with: () => ({
                scrollToRange: (range: unknown) => {
                    this.scrollRanges.push(range);
                    return true;
                },
            }),
        };
    }
}

class TestMarkSelectionService {
    readonly shapes = new Map<string, unknown>();

    addShape(selection: unknown) {
        const id = `shape-${this.shapes.size + 1}`;
        this.shapes.set(id, selection);
        return id;
    }

    addShapeWithNoFresh(selection: unknown) {
        return this.addShape(selection);
    }

    removeShape(id: string) {
        this.shapes.delete(id);
    }

    removeAllShapes() {
        this.shapes.clear();
    }

    refreshShapes() {}

    getShapeMap() {
        return this.shapes;
    }
}

class TestEditorBridgeService {
    forceKeepVisible = false;

    getCurrentEditorId() {
        return 'sheet-popup-editor';
    }

    isVisible() {
        return { visible: false };
    }

    getEditCellState() {
        return null;
    }

    enableForceKeepVisible() {
        this.forceKeepVisible = true;
    }

    disableForceKeepVisible() {
        this.forceKeepVisible = false;
    }
}

class TestDefinedNamesService {
    getValueById() {
        return undefined;
    }

    getDefinedNameMap() {
        return {};
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
    injector.add([IMarkSelectionService, { useClass: TestMarkSelectionService as never }]);
    injector.add([SheetCanvasPopManagerService, { useClass: TestCanvasPopManagerService as never }]);
    injector.add([SheetsSelectionsService]);
    injector.add([SheetsHyperLinkParserService]);
    injector.add([SheetsHyperLinkResolverService]);
    injector.add([SheetsHyperLinkPopupService]);
    injector.add([SheetsHyperLinkSidePanelService]);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData(customRange));
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-hyper-link-ui': {
                popup: {
                    edit: 'Edit',
                    cancel: 'Remove link',
                },
                form: {
                    label: 'Display text',
                    labelPlaceholder: 'Text',
                    type: 'Link type',
                    link: 'Web link',
                    range: 'Range',
                    worksheet: 'Worksheet',
                    definedName: 'Defined name',
                    linkPlaceholder: 'URL',
                    inputError: 'Required',
                    linkError: 'Invalid link',
                    selectError: 'Select a target',
                    cancel: 'Cancel',
                    ok: 'OK',
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
    commandService.registerCommand(AddHyperLinkCommand);
    commandService.registerCommand(CancelHyperLinkCommand);
    commandService.registerCommand(OpenHyperLinkEditPanelOperation);
    commandService.registerCommand(CloseHyperLinkPopupOperation);
    commandService.registerCommand(SetWorksheetActiveOperation);
    commandService.registerCommand(ScrollToRangeOperation);

    return {
        univer,
        injector,
        commandService,
        workbook,
        customRange,
    };
}

function inputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function selectOption(trigger: Element, optionText: string) {
    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    const option = Array.from(document.querySelectorAll('button, [data-slot="dropdown-menu-radio-item"]')).find((item) => item.textContent === optionText);

    if (!option) {
        throw new Error(`Option ${optionText} was not rendered`);
    }

    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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

    return {
        edit: container.querySelector('[data-u-comp="cell-link-popup-edit"]') as HTMLElement,
        remove: container.querySelector('[data-u-comp="cell-link-popup-remove"]') as HTMLElement,
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

describe('CellLinkEdit', () => {
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

    it('adds a URL hyperlink to the current cell text and closes the popup', async () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const popupService = currentTestBed.injector.get(SheetsHyperLinkPopupService);
        const renderManagerService = currentTestBed.injector.get(IRenderManagerService) as unknown as TestRenderManagerService;

        act(() => {
            popupService.startAddEditing({
                unitId: UNIT_ID,
                subUnitId: SUB_UNIT_ID,
                row: 0,
                col: 0,
                type: HyperLinkEditSourceType.VIEWING,
            });
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <CellLinkEdit />
                </RediContext.Provider>
            );
        });

        const inputs = Array.from(container.querySelectorAll('input'));
        expect(inputs).toHaveLength(1);

        await act(async () => {
            inputText(inputs[0], 'docs.univer.ai');
            await Promise.resolve();
        });
        renderManagerService.enableScrollRender = true;

        const formButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]'));
        const okButton = formButtons[formButtons.length - 1];
        expect(okButton).toBeDefined();

        await act(async () => {
            okButton!.click();
            await Promise.resolve();
        });

        const cell = currentTestBed.workbook.getSheetBySheetId(SUB_UNIT_ID)?.getCellRaw(0, 0);
        const body = cell?.p?.body;
        const linkRange = body?.customRanges?.find((range) => range.rangeType === CustomRangeType.HYPERLINK);

        expect(body?.dataStream).toBe('Univer\r\n');
        expect(linkRange?.properties?.url).toBe('http://docs.univer.ai');
        expect(popupService.currentEditing).toBeNull();
    });

    it('switches from URL to worksheet link and saves the selected sheet target', async () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const popupService = currentTestBed.injector.get(SheetsHyperLinkPopupService);
        const renderManagerService = currentTestBed.injector.get(IRenderManagerService) as unknown as TestRenderManagerService;

        act(() => {
            popupService.startAddEditing({
                unitId: UNIT_ID,
                subUnitId: SUB_UNIT_ID,
                row: 0,
                col: 0,
                type: HyperLinkEditSourceType.VIEWING,
            });
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <CellLinkEdit />
                </RediContext.Provider>
            );
        });

        const typeSelect = container.querySelector('[data-u-comp="select"]');
        expect(typeSelect?.textContent).toContain('sheets-hyper-link-ui.form.link');

        await act(async () => {
            await selectOption(typeSelect!, 'sheets-hyper-link-ui.form.worksheet');
            await Promise.resolve();
        });

        const selects = Array.from(container.querySelectorAll('[data-u-comp="select"]'));
        expect(selects).toHaveLength(2);

        await act(async () => {
            await selectOption(selects[1], 'Sheet 1');
            await Promise.resolve();
        });
        renderManagerService.enableScrollRender = true;

        const formButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-u-comp="button"]'));
        const okButton = formButtons[formButtons.length - 1];

        await act(async () => {
            okButton!.click();
            await Promise.resolve();
        });

        const cell = currentTestBed.workbook.getSheetBySheetId(SUB_UNIT_ID)?.getCellRaw(0, 0);
        const body = cell?.p?.body;
        const sheetLink = body?.customRanges?.find((range) => range.properties?.url === `#${SheetHyperLinkType.SHEET}=${SUB_UNIT_ID}`);

        expect(body?.dataStream).toBe('Univer\r\n');
        expect(sheetLink?.rangeType).toBe(CustomRangeType.HYPERLINK);
        expect(popupService.currentEditing).toBeNull();
    });
});
