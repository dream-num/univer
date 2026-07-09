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

import { Disposable, ICommandService, IConfigService, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';

import {
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
} from '@univerjs/sheets';
import {
    BuiltInUIPart,
    connectInjector,
    ILayoutService,
    IMenuManagerService,
    IUIPartsService,
} from '@univerjs/ui';
import { DeleteRangeMoveLeftConfirmCommand } from '../../commands/commands/delete-range-move-left-confirm.command';
import { DeleteRangeMoveUpConfirmCommand } from '../../commands/commands/delete-range-move-up-confirm.command';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../../commands/commands/headersize-changed.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../../commands/commands/hide-row-col-confirm.command';
import {
    ResetRangeTextColorCommand,
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeSubscriptCommand,
    SetRangeSuperscriptCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { InsertRangeMoveDownConfirmCommand } from '../../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../../commands/commands/insert-range-move-right-confirm.command';
import { AddRangeProtectionFromContextMenuCommand, AddRangeProtectionFromSheetBarCommand, AddRangeProtectionFromToolbarCommand, DeleteRangeProtectionFromContextMenuCommand, SetRangeProtectionFromContextMenuCommand, ViewSheetPermissionFromContextMenuCommand, ViewSheetPermissionFromSheetBarCommand } from '../../commands/commands/range-protection.command';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../../commands/commands/remove-row-col-confirm.command';
import { RemoveSheetConfirmCommand } from '../../commands/commands/remove-sheet-confirm.command';
import {
    ApplyFormatPainterCommand,
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import {
    SetColumnFrozenCommand,
    SetFirstColumnFrozenCommand,
    SetFirstRowFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../../commands/commands/set-frozen.command';
import { ScrollCommand, ScrollToCellCommand, SetScrollRelativeCommand } from '../../commands/commands/set-scroll.command';
import {
    ExpandSelectionCommand,
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
    SelectAllCommand,
} from '../../commands/commands/set-selection.command';
import { SetWorksheetColAutoWidthCommand } from '../../commands/commands/set-worksheet-auto-col-width.command';
import { ChangeZoomRatioCommand, SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { ShowMenuListCommand } from '../../commands/commands/unhide.command';
import { ChangeSheetProtectionFromSheetBarCommand, DeleteWorksheetProtectionFormSheetBarCommand } from '../../commands/commands/worksheet-protection.command';
import { SetActivateCellEditOperation } from '../../commands/operations/activate-cell-edit.operation';
import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
    SetCellEditVisibleWithF2Operation,
} from '../../commands/operations/cell-edit.operation';
import { RenameSheetOperation } from '../../commands/operations/rename-sheet.operation';
import { ScrollToRangeOperation } from '../../commands/operations/scroll-to-range.operation';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { SetFormatPainterOperation } from '../../commands/operations/set-format-painter.operation';
import { SetZoomRatioOperation } from '../../commands/operations/set-zoom-ratio.operation';
import { SheetPermissionOpenDialogOperation } from '../../commands/operations/sheet-permission-open-dialog.operation';
import { SheetPermissionOpenPanelOperation } from '../../commands/operations/sheet-permission-open-panel.operation';
import { SidebarDefinedNameOperation } from '../../commands/operations/sidebar-defined-name.operation';
import { menuSchema } from '../../menu/schema';
import { MobileSheetBar } from '../../views/mobile/sheet-bar/MobileSheetBar';
import { RenderSheetContent } from '../../views/sheet-container/SheetContainer';

export class SheetUIMobileController extends Disposable {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @ILayoutService protected readonly _layoutService: ILayoutService,
        @ICommandService protected readonly _commandService: ICommandService,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @IConfigService protected readonly _configService: IConfigService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initCommands();
        this._initMenus();
        this._initWorkbenchParts();
        this._initFocusHandler();
    }

    private _initCommands(): void {
        [
            ChangeZoomRatioCommand,
            ExpandSelectionCommand,
            MoveSelectionCommand,
            MoveSelectionEnterAndTabCommand,
            RenameSheetOperation,
            RemoveSheetConfirmCommand,
            RemoveRowConfirmCommand,
            RemoveColConfirmCommand,
            HideRowConfirmCommand,
            HideColConfirmCommand,
            ScrollCommand,
            ScrollToCellCommand,
            SelectAllCommand,
            SetActivateCellEditOperation,
            SetBoldCommand,
            SetCellEditVisibleArrowOperation,
            SetCellEditVisibleOperation,
            SetCellEditVisibleWithF2Operation,
            SetRangeBoldCommand,
            SetRangeItalicCommand,
            SetRangeUnderlineCommand,
            SetRangeStrickThroughCommand,
            SetRangeSubscriptCommand,
            SetRangeSuperscriptCommand,
            SetRangeFontSizeCommand,
            SetRangeFontFamilyCommand,
            SetRangeTextColorCommand,
            ResetRangeTextColorCommand,
            SetItalicCommand,
            SetStrikeThroughCommand,
            SetFontFamilyCommand,
            SetFontSizeCommand,
            SetFormatPainterOperation,
            SetInfiniteFormatPainterCommand,
            SetOnceFormatPainterCommand,
            ApplyFormatPainterCommand,
            SetScrollOperation,
            SetScrollRelativeCommand,
            SetSelectionFrozenCommand,
            SetRowFrozenCommand,
            SetColumnFrozenCommand,
            SetFirstRowFrozenCommand,
            SetFirstColumnFrozenCommand,
            ScrollToRangeOperation,
            SetUnderlineCommand,
            SetZoomRatioCommand,
            SetZoomRatioOperation,
            ShowMenuListCommand,
            InsertRangeMoveDownConfirmCommand,
            DeleteRangeMoveUpConfirmCommand,
            InsertRangeMoveRightConfirmCommand,
            DeleteRangeMoveLeftConfirmCommand,
            SidebarDefinedNameOperation,

            // permission
            SheetPermissionOpenPanelOperation,
            SheetPermissionOpenDialogOperation,
            AddRangeProtectionFromToolbarCommand,
            AddRangeProtectionFromContextMenuCommand,
            ViewSheetPermissionFromContextMenuCommand,
            AddRangeProtectionFromSheetBarCommand,
            ViewSheetPermissionFromSheetBarCommand,
            ChangeSheetProtectionFromSheetBarCommand,
            DeleteRangeProtectionFromContextMenuCommand,
            SetRangeProtectionFromContextMenuCommand,
            DeleteWorksheetProtectionFormSheetBarCommand,
            SetWorksheetColAutoWidthCommand,
            SetRowHeaderWidthCommand,
            SetColumnHeaderHeightCommand,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initWorkbenchParts(): void {
        const uiController = this._uiPartsService;
        const injector = this._injector;

        // Use the same FormulaBar implementation as desktop for now.
        // this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.HEADER, () => connectInjector(RenderSheetHeader, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(MobileSheetBar, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(RenderSheetContent, injector)));
    }

    private _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_SHEET, (_unitId: string) => {
                // DEBT: `_unitId` is not used hence we cannot support Univer mode now
                // TODO@wzhudev: focus is different on mobile devices

                const renderManagerService = this._injector.get(IRenderManagerService);
                const instanceService = this._injector.get(IUniverInstanceService);
                const currentEditorRender = getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_DOC, instanceService, renderManagerService);
                const docSelectionRenderService = currentEditorRender?.with(DocSelectionRenderService);

                docSelectionRenderService?.focus();
            })
        );
    }
}
