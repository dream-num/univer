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

import type { IDisposable, IMutation, IStyleData } from '@univerjs/core';
import { Disposable, ICommandService, IConfigService, Optional } from '@univerjs/core';
import { DataSyncPrimaryController } from '@univerjs/rpc';
import { AddRangeProtectionCommand } from '../commands/commands/add-range-protection.command';
import { AddWorksheetProtectionCommand } from '../commands/commands/add-worksheet-protection.command';
import { SetWorksheetRangeThemeStyleCommand } from '../commands/commands/add-worksheet-range-theme.command';
import { AppendRowCommand } from '../commands/commands/append-row.command';
import { ClearSelectionAllCommand } from '../commands/commands/clear-selection-all.command';
import { ClearSelectionContentCommand } from '../commands/commands/clear-selection-content.command';
import { ClearSelectionFormatCommand } from '../commands/commands/clear-selection-format.command';
import { CopySheetCommand } from '../commands/commands/copy-worksheet.command';
import { DeleteRangeMoveLeftCommand } from '../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveUpCommand } from '../commands/commands/delete-range-move-up.command';
import { DeleteRangeProtectionCommand } from '../commands/commands/delete-range-protection.command';
import { DeleteWorksheetProtectionCommand } from '../commands/commands/delete-worksheet-protection.command';
import { DeleteWorksheetRangeThemeStyleCommand } from '../commands/commands/delete-worksheet-range-theme.command';
import { InsertDefinedNameCommand } from '../commands/commands/insert-defined-name.command';
import { InsertRangeMoveDownCommand } from '../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../commands/commands/insert-range-move-right.command';
import {
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertColByRangeCommand,
    InsertColCommand,
    InsertMultiColsLeftCommand,
    InsertMultiColsRightCommand,
    InsertMultiRowsAboveCommand,
    InsertMultiRowsAfterCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertRowByRangeCommand,
    InsertRowCommand,
} from '../commands/commands/insert-row-col.command';
import { InsertSheetCommand } from '../commands/commands/insert-sheet.command';
import { MoveRangeCommand } from '../commands/commands/move-range.command';
import { MoveColsCommand, MoveRowsCommand } from '../commands/commands/move-rows-cols.command';
import { RegisterWorksheetRangeThemeStyleCommand } from '../commands/commands/register-range-theme.command';
import { RemoveDefinedNameCommand } from '../commands/commands/remove-defined-name.command';
import { RemoveColByRangeCommand, RemoveColCommand, RemoveRowByRangeCommand, RemoveRowCommand } from '../commands/commands/remove-row-col.command';
import { RemoveSheetCommand } from '../commands/commands/remove-sheet.command';
import { RemoveWorksheetMergeCommand } from '../commands/commands/remove-worksheet-merge.command';
import { ReorderRangeCommand } from '../commands/commands/reorder-range.command';
import {
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '../commands/commands/set-border-command';
import { SetColDataCommand } from '../commands/commands/set-col-data.command';
import {
    SetColHiddenCommand,
    SetSelectedColsVisibleCommand,
    SetSpecificColsVisibleCommand,
} from '../commands/commands/set-col-visible.command';
import { SetDefinedNameCommand } from '../commands/commands/set-defined-name.command';
import { CancelFrozenCommand, SetFrozenCommand } from '../commands/commands/set-frozen.command';
import { SetGridlinesColorCommand } from '../commands/commands/set-gridlines-color.command';
import { SetProtectionCommand } from '../commands/commands/set-protection.command';
import { SetRangeValuesCommand } from '../commands/commands/set-range-values.command';
import { SetRowDataCommand } from '../commands/commands/set-row-data.command';
import {
    SetRowHiddenCommand,
    SetSelectedRowsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from '../commands/commands/set-row-visible.command';
import {
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SetBackgroundColorCommand,
    SetHorizontalTextAlignCommand,
    SetStyleCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
} from '../commands/commands/set-style.command';
import { SetTabColorCommand } from '../commands/commands/set-tab-color.command';
import { SetWorkbookNameCommand } from '../commands/commands/set-workbook-name.command';
import { SetWorksheetActivateCommand } from '../commands/commands/set-worksheet-activate.command';
import { DeltaColumnWidthCommand, SetColWidthCommand } from '../commands/commands/set-worksheet-col-width.command';
import { SetWorksheetColumnCountCommand } from '../commands/commands/set-worksheet-column-count.command';
import { SetWorksheetDefaultStyleCommand } from '../commands/commands/set-worksheet-default-style.command';
import { SetWorksheetHideCommand } from '../commands/commands/set-worksheet-hide.command';
import { SetWorksheetNameCommand } from '../commands/commands/set-worksheet-name.command';
import { SetWorksheetOrderCommand } from '../commands/commands/set-worksheet-order.command';
import { SetWorksheetPermissionPointsCommand } from '../commands/commands/set-worksheet-permission-points.command';
import { SetWorksheetProtectionCommand } from '../commands/commands/set-worksheet-protection.command';
import { SetWorksheetRowCountCommand } from '../commands/commands/set-worksheet-row-count.command';
import {
    DeltaRowHeightCommand,
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from '../commands/commands/set-worksheet-row-height.command';
import { SetWorksheetShowCommand } from '../commands/commands/set-worksheet-show.command';
import { SplitTextToColumnsCommand } from '../commands/commands/split-text-to-columns.command';
import { ToggleCellCheckboxCommand } from '../commands/commands/toggle-checkbox.command';
import { ToggleGridlinesCommand } from '../commands/commands/toggle-gridlines.command';
import { UnregisterWorksheetRangeThemeStyleCommand } from '../commands/commands/unregister-range-theme.command';
import { AddRangeProtectionMutation } from '../commands/mutations/add-range-protection.mutation';
import { AddWorksheetMergeMutation } from '../commands/mutations/add-worksheet-merge.mutation';
import { AddWorksheetProtectionMutation } from '../commands/mutations/add-worksheet-protection.mutation';
import { SetWorksheetRangeThemeStyleMutation } from '../commands/mutations/add-worksheet-range-theme.mutation';
import { DeleteRangeProtectionMutation } from '../commands/mutations/delete-range-protection.mutation';
import { DeleteWorksheetProtectionMutation } from '../commands/mutations/delete-worksheet-protection.mutation';
import { DeleteWorksheetRangeThemeStyleMutation } from '../commands/mutations/delete-worksheet-range-theme.mutation';
import { EmptyMutation } from '../commands/mutations/empty.mutation';
import { InsertColMutation, InsertRowMutation } from '../commands/mutations/insert-row-col.mutation';
import { InsertSheetMutation } from '../commands/mutations/insert-sheet.mutation';
import { MoveRangeMutation } from '../commands/mutations/move-range.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../commands/mutations/move-rows-cols.mutation';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '../commands/mutations/numfmt-mutation';
import { RegisterWorksheetRangeThemeStyleMutation } from '../commands/mutations/register-range-theme.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../commands/mutations/remove-row-col.mutation';
import { RemoveSheetMutation } from '../commands/mutations/remove-sheet.mutation';
import { RemoveWorksheetMergeMutation } from '../commands/mutations/remove-worksheet-merge.mutation';
import { ReorderRangeMutation } from '../commands/mutations/reorder-range.mutation';
import { SetColDataMutation } from '../commands/mutations/set-col-data.mutation';
import { SetColHiddenMutation, SetColVisibleMutation } from '../commands/mutations/set-col-visible.mutation';
import { SetFrozenMutation } from '../commands/mutations/set-frozen.mutation';
import { SetGridlinesColorMutation } from '../commands/mutations/set-gridlines-color.mutation';
import { SetRangeProtectionMutation } from '../commands/mutations/set-range-protection.mutation';
import { SetRangeValuesMutation } from '../commands/mutations/set-range-values.mutation';
import { SetRowDataMutation } from '../commands/mutations/set-row-data.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../commands/mutations/set-row-visible.mutation';
import { SetTabColorMutation } from '../commands/mutations/set-tab-color.mutation';
import { SetWorkbookNameMutation } from '../commands/mutations/set-workbook-name.mutation';
import { SetWorksheetColWidthMutation } from '../commands/mutations/set-worksheet-col-width.mutation';
import { SetWorksheetColumnCountMutation } from '../commands/mutations/set-worksheet-column-count.mutation';
import { SetWorksheetDefaultStyleMutation } from '../commands/mutations/set-worksheet-default-style.mutation';
import { SetWorksheetHideMutation } from '../commands/mutations/set-worksheet-hide.mutation';
import { SetWorksheetNameMutation } from '../commands/mutations/set-worksheet-name.mutation';
import { SetWorksheetOrderMutation } from '../commands/mutations/set-worksheet-order.mutation';
import { SetWorksheetPermissionPointsMutation } from '../commands/mutations/set-worksheet-permission-points.mutation';
import { SetWorksheetProtectionMutation } from '../commands/mutations/set-worksheet-protection.mutation';
import { SetWorksheetRowCountMutation } from '../commands/mutations/set-worksheet-row-count.mutation';
import {
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../commands/mutations/set-worksheet-row-height.mutation';
import { ToggleGridlinesMutation } from '../commands/mutations/toggle-gridlines.mutation';
import { UnregisterWorksheetRangeThemeStyleMutation } from '../commands/mutations/unregister-range-theme-style.mutation';
import { ScrollToCellOperation } from '../commands/operations/scroll-to-cell.operation';
import { SelectRangeCommand, SetSelectionsOperation } from '../commands/operations/selection.operation';
import { SetWorksheetActiveOperation } from '../commands/operations/set-worksheet-active.operation';
import { ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY } from './config';
import { MAX_CELL_PER_SHEET_DEFAULT, MAX_CELL_PER_SHEET_KEY } from './config/config';
import { SetRangeThemeMutation } from '../commands/mutations/set-range-theme.mutation';
import { RemoveRangeThemeMutation } from '../commands/mutations/remove-range-theme.mutation';
import { AddRangeThemeMutation } from '../commands/mutations/add-range-theme.mutation';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
export class BasicWorksheetController extends Disposable implements IDisposable {
    // eslint-disable-next-line max-lines-per-function
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @Optional(DataSyncPrimaryController) private readonly _dataSyncPrimaryController?: DataSyncPrimaryController
    ) {
        super();

        ([
            SetRangeValuesMutation,
            InsertColMutation,
            InsertRowMutation,
            InsertSheetMutation,
            MoveRangeMutation,
            MoveRowsMutation,
            MoveColsMutation,
            RemoveColMutation,
            RemoveRowMutation,
            RemoveSheetMutation,
            RemoveWorksheetMergeMutation,
            RemoveNumfmtMutation,
            AddWorksheetMergeMutation,
            SetWorkbookNameMutation,
            SetWorksheetNameMutation,
            SetNumfmtMutation,
            ReorderRangeMutation,
            EmptyMutation,
            SetRowHiddenMutation, // formula SUBTOTAL
            SetRowVisibleMutation,
        ] as IMutation<object>[]).forEach((mutation) => {
            this._commandService.registerCommand(mutation);
            this._dataSyncPrimaryController?.registerSyncingMutations(mutation);
        });

        const onlyRegisterFormulaRelatedMutations = this._configService.getConfig(ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY) ?? false;
        if (!onlyRegisterFormulaRelatedMutations) {
            [
                AppendRowCommand,
                ClearSelectionAllCommand,
                ClearSelectionContentCommand,
                ClearSelectionFormatCommand,
                CopySheetCommand,
                DeleteRangeMoveLeftCommand,
                DeleteRangeMoveUpCommand,
                DeltaColumnWidthCommand,
                DeltaRowHeightCommand,
                InsertColAfterCommand,
                InsertColBeforeCommand,
                InsertMultiColsLeftCommand,
                InsertMultiColsRightCommand,
                InsertColByRangeCommand,
                InsertColCommand,
                InsertRangeMoveDownCommand,
                InsertRangeMoveRightCommand,
                InsertRowAfterCommand,
                InsertRowBeforeCommand,
                InsertMultiRowsAfterCommand,
                InsertMultiRowsAboveCommand,
                InsertRowByRangeCommand,
                InsertRowCommand,
                InsertSheetCommand,
                MoveColsCommand,
                MoveRangeCommand,
                MoveRowsCommand,
                RemoveRowByRangeCommand,
                RemoveColCommand,
                RemoveColByRangeCommand,
                RemoveRowCommand,
                RemoveSheetCommand,
                ReorderRangeCommand,

                RemoveWorksheetMergeCommand,
                ResetBackgroundColorCommand,
                ResetTextColorCommand,
                SetBackgroundColorCommand,
                SetBorderBasicCommand,
                SetBorderColorCommand,
                SetBorderCommand,
                SetBorderPositionCommand,
                SetBorderStyleCommand,
                SetColHiddenCommand,
                SetColHiddenMutation,
                SetColVisibleMutation,
                SetColWidthCommand,
                SetColDataCommand,
                SetColDataMutation,
                SetFrozenCommand,
                SetFrozenMutation,
                CancelFrozenCommand,
                SetHorizontalTextAlignCommand,
                SetRangeValuesCommand,
                SetRowHeightCommand,
                SetRowHiddenCommand,
                SetRowDataCommand,
                SetRowDataMutation,
                SetSelectedColsVisibleCommand,
                SetSelectedRowsVisibleCommand,
                SetSpecificColsVisibleCommand,
                SetSpecificRowsVisibleCommand,
                SetStyleCommand,
                SetTabColorCommand,
                SetTabColorMutation,
                SetTextColorCommand,
                SetTextRotationCommand,
                SetTextWrapCommand,
                SetVerticalTextAlignCommand,
                SetWorkbookNameCommand,
                SetWorksheetActivateCommand,
                SetWorksheetActiveOperation,

                SetWorksheetHideCommand,
                SetWorksheetHideMutation,
                SetWorksheetNameCommand,
                SetWorksheetOrderCommand,
                SetWorksheetOrderMutation,

                SetWorksheetRowAutoHeightMutation,
                SetWorksheetRowHeightMutation,
                SetWorksheetRowIsAutoHeightCommand,
                SetWorksheetRowIsAutoHeightMutation,
                SetWorksheetColWidthMutation,
                // SetWorksheetColIsAutoWidthCommand,

                SetWorksheetRowCountCommand,
                SetWorksheetRowCountMutation,
                SetWorksheetColumnCountCommand,
                SetWorksheetColumnCountMutation,

                SelectRangeCommand,
                SetSelectionsOperation,
                ScrollToCellOperation,
                InsertDefinedNameCommand,
                RemoveDefinedNameCommand,
                SetDefinedNameCommand,
                SetWorksheetShowCommand,

                ToggleGridlinesCommand,
                ToggleGridlinesMutation,
                SetGridlinesColorCommand,
                SetGridlinesColorMutation,

                // permissions range protection
                SetWorksheetPermissionPointsCommand,
                AddWorksheetProtectionMutation,
                SetWorksheetProtectionMutation,
                DeleteWorksheetProtectionMutation,
                SetWorksheetPermissionPointsMutation,
                AddRangeProtectionCommand,
                SetProtectionCommand,
                DeleteRangeProtectionCommand,
                AddWorksheetProtectionCommand,
                DeleteWorksheetProtectionCommand,
                SetWorksheetProtectionCommand,
                AddRangeProtectionMutation,
                DeleteRangeProtectionMutation,
                SetRangeProtectionMutation,

                ToggleCellCheckboxCommand,
                SetWorksheetDefaultStyleMutation,
                SetWorksheetDefaultStyleCommand,

                SplitTextToColumnsCommand,

                // range theme

                DeleteWorksheetRangeThemeStyleMutation,
                SetWorksheetRangeThemeStyleMutation,
                UnregisterWorksheetRangeThemeStyleMutation,
                RegisterWorksheetRangeThemeStyleMutation,
                UnregisterWorksheetRangeThemeStyleCommand,
                RegisterWorksheetRangeThemeStyleCommand,
                SetWorksheetRangeThemeStyleCommand,
                DeleteWorksheetRangeThemeStyleCommand,

                AddRangeThemeMutation,
                SetRangeThemeMutation,
                RemoveRangeThemeMutation,

            ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
        }

        this._configService.setConfig(MAX_CELL_PER_SHEET_KEY, MAX_CELL_PER_SHEET_DEFAULT);
    }
}
