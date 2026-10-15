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
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    AddHyperLinkCommand,
    AddHyperLinkMutation,
    CancelHyperLinkCommand,
    HyperLinkModel,
    RemoveHyperLinkMutation,
    SheetsHyperLinkParserService,
    UpdateHyperLinkMutation,
} from '@univerjs/sheets-hyper-link';
import {
    IEditorBridgeService,
    IMarkSelectionService,
    MarkSelectionService,
    ScrollToRangeOperation,
    SheetCanvasPopManagerService,
} from '@univerjs/sheets-ui';
import { IDialogService, IMessageService } from '@univerjs/ui';
import { of } from 'rxjs';
import {
    CloseHyperLinkPopupOperation,
    OpenHyperLinkEditPanelOperation,
} from '../../commands/operations/popup.operations';
import { ISheetsHyperLinkPopupService, SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { SheetsHyperLinkSidePanelService } from '../../services/side-panel.service';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'sheet-link-popup-workbook';
const SUB_UNIT_ID = 'sheet-1';
const MERGED_RANGE = { startRow: 2, endRow: 5, startColumn: 1, endColumn: 3 };

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

    getRenderUnitById(id: string) {
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

class TestDialogService {
    open() {
        return toDisposable(() => undefined);
    }

    close(): void {}

    closeAll(): void {}

    getDialogs$() {
        return of([]);
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
                mergeData: [MERGED_RANGE],
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
    injector.add([IDialogService, { useClass: TestDialogService }]);
    injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
    injector.add([SheetSkeletonService]);
    injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
    injector.add([SheetCanvasPopManagerService, { useClass: TestCanvasPopManagerService as never }]);
    injector.add([SheetsSelectionsService]);
    injector.add([SheetsHyperLinkParserService]);
    injector.add([SheetsHyperLinkResolverService]);
    injector.add([ISheetsHyperLinkPopupService, { useClass: SheetsHyperLinkPopupService }]);
    injector.add([SheetsHyperLinkSidePanelService]);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData(customRange));
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-hyper-link-ui': {
                popup: {
                    open: 'Open link',
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
    commandService.registerCommand(SetSelectionsOperation);
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

export { createPopupTestBed, inputText, MERGED_RANGE, selectOption, SUB_UNIT_ID, TestRenderManagerService, UNIT_ID };
