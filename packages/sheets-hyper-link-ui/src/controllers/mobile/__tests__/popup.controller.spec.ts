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

import type { ICellData } from '@univerjs/core';
import type { IHoverRichTextInfo } from '@univerjs/sheets-ui';
import type { IHyperLinkPopupOptions } from '../../../services/popup.service';
import {
    CustomRangeType,
    ICommandService,
    Injector,
    IPermissionService,
    IUniverInstanceService,
    RichTextBuilder,
    toDisposable,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import { HoverManagerService, IEditorBridgeService } from '@univerjs/sheets-ui';
import { of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetsHyperLinkPopupService } from '../../../services/popup.service';
import { SheetsHyperLinkMobilePopupController } from '../popup.controller';

class TestHoverManagerService {
    readonly currentClickedCell$ = new Subject<IHoverRichTextInfo>();
}

class TestSheetsHyperLinkPopupService {
    readonly shown: IHyperLinkPopupOptions[] = [];
    hideCount = 0;

    showPopup(location: IHyperLinkPopupOptions): void {
        this.shown.push(location);
    }

    hideCurrentPopup(): void {
        this.hideCount += 1;
    }

    endEditing(): void {}
}

class TestRenderManagerService {
    getRenderUnitById() {
        return {
            with: () => ({
                getSkeletonParam: () => ({
                    skeleton: {
                        overflowCache: {
                            forValue: () => {},
                        },
                    },
                }),
            }),
        };
    }
}

class TestPermissionService {
    composePermission() {
        return [{ value: true }];
    }
}

class TestSheetPermissionCheckController {
    permissionCheckWithRanges(): boolean {
        return true;
    }
}

class TestCommandService {
    onCommandExecuted() {
        return toDisposable(() => undefined);
    }
}

class TestEditorBridgeService {
    readonly currentEditCellState$ = of(null);
    readonly visible$ = of({ visible: false });
}

class TestDocSelectionManagerService {
    readonly textSelection$ = new Subject();
}

class TestUniverInstanceService {
    cell: ICellData = {};

    readonly worksheet = {
        getCell: () => this.cell,
        getCellRaw: () => ({}),
        getCellStyleOnly: () => ({}),
    };

    readonly workbook = {
        getSheetBySheetId: () => this.worksheet,
        getStyles: () => ({
            getStyleByCell: () => ({}),
        }),
    };

    getUnit() {
        return this.workbook;
    }
}

function createMobilePopupControllerTestBed() {
    const injector = new Injector();
    injector.add([HoverManagerService, { useClass: TestHoverManagerService as never }]);
    injector.add([SheetsHyperLinkPopupService, { useClass: TestSheetsHyperLinkPopupService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IPermissionService, { useClass: TestPermissionService as never }]);
    injector.add([SheetPermissionCheckController, { useClass: TestSheetPermissionCheckController as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
    injector.add([DocSelectionManagerService, { useClass: TestDocSelectionManagerService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([SheetsHyperLinkMobilePopupController]);
    injector.get(SheetsHyperLinkMobilePopupController);

    return {
        hoverManagerService: injector.get(HoverManagerService) as unknown as TestHoverManagerService,
        popupService: injector.get(SheetsHyperLinkPopupService) as unknown as TestSheetsHyperLinkPopupService,
        univerInstanceService: injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService,
    };
}

describe('SheetsHyperLinkMobilePopupController', () => {
    it('opens the hyperlink popup when the hyperlink text is clicked', () => {
        const { hoverManagerService, popupService } = createMobilePopupControllerTestBed();
        const customRange = {
            rangeId: 'link-1',
            rangeType: CustomRangeType.HYPERLINK,
            startIndex: 0,
            endIndex: 5,
            properties: { url: 'https://univer.ai' },
        };

        hoverManagerService.currentClickedCell$.next({
            location: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                row: 2,
                col: 3,
            },
            position: { startX: 0, startY: 0, endX: 20, endY: 20 },
            customRange,
            rect: { left: 0, top: 0, right: 20, bottom: 20 },
        });

        expect(popupService.shown).toEqual([
            expect.objectContaining({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                row: 2,
                col: 3,
                customRange,
                editPermission: true,
                copyPermission: true,
            }),
        ]);
        expect(popupService.hideCount).toBe(0);
    });

    it('opens the hyperlink popup when the empty area of a hyperlink cell is clicked', () => {
        const { hoverManagerService, popupService, univerInstanceService } = createMobilePopupControllerTestBed();
        const documentData = RichTextBuilder.create()
            .insertLink('Univer', 'https://univer.ai')
            .getData();
        const customRange = documentData.body!.customRanges![0];
        univerInstanceService.cell = {
            p: documentData,
        };

        hoverManagerService.currentClickedCell$.next({
            location: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                row: 2,
                col: 3,
            },
            position: { startX: 0, startY: 0, endX: 100, endY: 20 },
        });

        expect(popupService.shown).toEqual([
            expect.objectContaining({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                row: 2,
                col: 3,
                customRange,
                editPermission: true,
                copyPermission: true,
            }),
        ]);
        expect(popupService.hideCount).toBe(0);
    });

    it('shows all hyperlinks when the empty area of a cell containing multiple hyperlinks is clicked', () => {
        const { hoverManagerService, popupService, univerInstanceService } = createMobilePopupControllerTestBed();
        const documentData = RichTextBuilder.create()
            .insertLink('Univer', 'https://univer.ai')
            .insertText(' ')
            .insertLink('Docs', 'https://docs.univer.ai')
            .getData();
        const firstCustomRange = documentData.body!.customRanges![0];
        univerInstanceService.cell = {
            p: documentData,
        };

        hoverManagerService.currentClickedCell$.next({
            location: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                row: 2,
                col: 3,
            },
            position: { startX: 0, startY: 0, endX: 100, endY: 20 },
        });

        expect(popupService.shown).toEqual([
            expect.objectContaining({
                customRange: firstCustomRange,
                showAll: true,
            }),
        ]);
        expect(popupService.hideCount).toBe(0);
    });
});
