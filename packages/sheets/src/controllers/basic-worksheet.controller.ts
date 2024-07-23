/**
 * Copyright 2023-present DreamNum Inc.
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
import { Disposable, ICommandService, IConfigService, LifecycleStages, OnLifecycle, Optional } from '@univerjs/core';
import { DataSyncPrimaryController } from '@univerjs/rpc';

import { ClearSelectionAllCommand } from '../commands/commands/clear-selection-all.command';
import { ClearSelectionContentCommand } from '../commands/commands/clear-selection-content.command';
import { ClearSelectionFormatCommand } from '../commands/commands/clear-selection-format.command';
import { CopySheetCommand } from '../commands/commands/copy-worksheet.command';
import { DeleteRangeMoveLeftCommand } from '../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveUpCommand } from '../commands/commands/delete-range-move-up.command';
import { InsertRangeMoveDownCommand } from '../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../commands/commands/insert-range-move-right.command';
import {
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertColCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertRowCommand,
} from '../commands/commands/insert-row-col.command';
import { InsertSheetCommand } from '../commands/commands/insert-sheet.command';
import { MoveRangeCommand } from '../commands/commands/move-range.command';
import { MoveColsCommand, MoveRowsCommand } from '../commands/commands/move-rows-cols.command';
import { RemoveColCommand, RemoveRowCommand } from '../commands/commands/remove-row-col.command';
import { RemoveSheetCommand } from '../commands/commands/remove-sheet.command';
import { RemoveWorksheetMergeCommand } from '../commands/commands/remove-worksheet-merge.command';
import {
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '../commands/commands/set-border-command';
import {
    SetColHiddenCommand,
    SetSelectedColsVisibleCommand,
    SetSpecificColsVisibleCommand,
} from '../commands/commands/set-col-visible.command';
import { SetFrozenCommand } from '../commands/commands/set-frozen.command';
import { SetFrozenCancelCommand } from '../commands/commands/set-frozen-cancel.command';
import { SetRangeValuesCommand } from '../commands/commands/set-range-values.command';
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
import { SetWorksheetActivateCommand } from '../commands/commands/set-worksheet-activate.command';
import { DeltaColumnWidthCommand, SetColWidthCommand } from '../commands/commands/set-worksheet-col-width.command';
import { SetWorksheetHideCommand } from '../commands/commands/set-worksheet-hide.command';
import { SetWorksheetNameCommand } from '../commands/commands/set-worksheet-name.command';
import { SetWorksheetOrderCommand } from '../commands/commands/set-worksheet-order.command';
import {
    DeltaRowHeightCommand,
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from '../commands/commands/set-worksheet-row-height.command';
import { SetWorksheetShowCommand } from '../commands/commands/set-worksheet-show.command';
import { InsertColMutation, InsertRowMutation } from '../commands/mutations/insert-row-col.mutation';
import { InsertSheetMutation } from '../commands/mutations/insert-sheet.mutation';
import { MoveRangeMutation } from '../commands/mutations/move-range.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../commands/mutations/move-rows-cols.mutation';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '../commands/mutations/numfmt-mutation';
import { RemoveColMutation, RemoveRowMutation } from '../commands/mutations/remove-row-col.mutation';
import { RemoveSheetMutation } from '../commands/mutations/remove-sheet.mutation';
import { RemoveWorksheetMergeMutation } from '../commands/mutations/remove-worksheet-merge.mutation';
import { SetColHiddenMutation, SetColVisibleMutation } from '../commands/mutations/set-col-visible.mutation';
import { SetFrozenMutation } from '../commands/mutations/set-frozen.mutation';
import { SetRangeValuesMutation } from '../commands/mutations/set-range-values.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../commands/mutations/set-row-visible.mutation';
import { SetTabColorMutation } from '../commands/mutations/set-tab-color.mutation';
import { SetWorksheetColWidthMutation } from '../commands/mutations/set-worksheet-col-width.mutation';
import { SetWorksheetHideMutation } from '../commands/mutations/set-worksheet-hide.mutation';
import { SetWorksheetNameMutation } from '../commands/mutations/set-worksheet-name.mutation';
import { SetWorksheetOrderMutation } from '../commands/mutations/set-worksheet-order.mutation';
import {
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../commands/mutations/set-worksheet-row-height.mutation';
import { SetSelectionsOperation } from '../commands/operations/selection.operation';
import { SetWorksheetActiveOperation } from '../commands/operations/set-worksheet-active.operation';
import { EmptyMutation } from '../commands/mutations/empty.mutation';
import { InsertDefinedNameCommand } from '../commands/commands/insert-defined-name.command';
import { RemoveDefinedNameCommand } from '../commands/commands/remove-defined-name.command';
import { SetDefinedNameCommand } from '../commands/commands/set-defined-name.command';
import { ScrollToCellOperation } from '../commands/operations/scroll-to-cell.operation';
import { SetWorkbookNameCommand } from '../commands/commands/set-workbook-name.command';
import { SetWorkbookNameMutation } from '../commands/mutations/set-workbook-name.mutation';
import { AddWorksheetProtectionMutation } from '../commands/mutations/add-worksheet-protection.mutation';
import { SetWorksheetProtectionMutation } from '../commands/mutations/set-worksheet-protection.mutation';
import { DeleteWorksheetProtectionMutation } from '../commands/mutations/delete-worksheet-protection.mutation';
import { SetWorksheetPermissionPointsMutation } from '../commands/mutations/set-worksheet-permission-points.mutation';
import { SetWorksheetPermissionPointsCommand } from '../commands/commands/set-worksheet-permission-points.command';

import { AddRangeProtectionCommand } from '../commands/commands/add-range-protection.command';
import { DeleteRangeProtectionCommand } from '../commands/commands/delete-range-protection.command';
import { SetRangeProtectionCommand } from '../commands/commands/set-range-protection.command';

import { AddRangeProtectionMutation } from '../commands/mutations/add-range-protection.mutation';
import { DeleteRangeProtectionMutation } from '../commands/mutations/delete-range-protection.mutation';
import { SetRangeProtectionMutation } from '../commands/mutations/set-range-protection.mutation';
import { AddWorksheetMergeMutation } from '../commands/mutations/add-worksheet-merge.mutation';
import { ReorderRangeCommand } from '../commands/commands/reorder-range.command';
import { ReorderRangeMutation } from '../commands/mutations/reorder-range.mutation';
import { MAX_CELL_PER_SHEET_DEFAULT, MAX_CELL_PER_SHEET_KEY } from './config/config';
import { ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY } from './config';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
@OnLifecycle(LifecycleStages.Starting, BasicWorksheetController)
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
            SetWorksheetColWidthMutation,
        ] as IMutation<object>[]).forEach((mutation) => {
            this._commandService.registerCommand(mutation);
            this._dataSyncPrimaryController?.registerSyncingMutations(mutation);
        });

        const onlyRegisterFormulaRelatedMutations = this._configService.getConfig(ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY) ?? false;
        if (!onlyRegisterFormulaRelatedMutations) {
            [
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
                InsertColCommand,
                InsertRangeMoveDownCommand,
                InsertRangeMoveRightCommand,
                InsertRowAfterCommand,
                InsertRowBeforeCommand,
                InsertRowCommand,
                InsertSheetCommand,
                MoveColsCommand,
                MoveRangeCommand,
                MoveRowsCommand,
                RemoveColCommand,
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
                SetFrozenCancelCommand,
                SetFrozenCommand,
                SetFrozenMutation,
                SetHorizontalTextAlignCommand,
                SetRangeValuesCommand,
                SetRowHeightCommand,
                SetRowHiddenCommand,
                SetRowHiddenMutation,
                SetRowVisibleMutation,
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
                SetSelectionsOperation,
                ScrollToCellOperation,
                InsertDefinedNameCommand,
                RemoveDefinedNameCommand,
                SetDefinedNameCommand,
                SetWorksheetShowCommand,

                // permissions range protection
                SetWorksheetPermissionPointsCommand,
                AddWorksheetProtectionMutation,
                SetWorksheetProtectionMutation,
                DeleteWorksheetProtectionMutation,
                SetWorksheetPermissionPointsMutation,
                AddRangeProtectionCommand,
                DeleteRangeProtectionCommand,
                SetRangeProtectionCommand,
                AddRangeProtectionMutation,
                DeleteRangeProtectionMutation,
                SetRangeProtectionMutation,
            ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
        }

        this._configService.setConfig(MAX_CELL_PER_SHEET_KEY, MAX_CELL_PER_SHEET_DEFAULT);
    }
}
