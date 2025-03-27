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

import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { RecordSingle } from '@univerjs/icons';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    CancelFrozenCommand,
    CopySheetCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertSheetCommand,
    RemoveSheetCommand,
    SetFrozenCommand,
    SetHorizontalTextAlignCommand,
    SetOverlineCommand,
    SetRangeValuesCommand,
    SetSelectionsOperation,
    SetStrikeThroughCommand,
    SetStyleCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetActivateCommand,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { RemoveSheetFilterCommand, SetSheetFilterRangeCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';
import {
    AutoFillCommand,
    RefillCommand,
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeSubscriptCommand,
    SetRangeSuperscriptCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteShortKeyCommand,
    SheetPasteValueCommand,
} from '@univerjs/sheets-ui';
import {
    BuiltInUIPart,
    ComponentManager,
    connectInjector,
    IMenuManagerService,
    IUIPartsService,
} from '@univerjs/ui';
import { CompleteRecordingActionCommand, StartRecordingActionCommand, StopRecordingActionCommand } from '../commands/commands/record.command';
import { ReplayLocalRecordCommand, ReplayLocalRecordOnActiveCommand, ReplayLocalRecordOnNamesakeCommand } from '../commands/commands/replay.command';
import { CloseRecordPanelOperation, OpenRecordPanelOperation } from '../commands/operations/operation';
import { ActionRecorderService } from '../services/action-recorder.service';
import { RecorderPanel } from '../views/components/RecorderPanel';
import { menuSchema } from './action-recorder.menu';

export class ActionRecorderController extends Disposable {
    constructor(
        @ICommandService private readonly _commandSrv: ICommandService,
        @IUIPartsService private readonly _uiPartsSrv: IUIPartsService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(ActionRecorderService) private readonly _actionRecorderService: ActionRecorderService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initCommands();
        this._initUI();
        this._initSheetsCommands();
        this._initDocsCommands();
    }

    private _initCommands(): void {
        ([
            StartRecordingActionCommand,
            StopRecordingActionCommand,
            CompleteRecordingActionCommand,
            OpenRecordPanelOperation,
            CloseRecordPanelOperation,
            ReplayLocalRecordCommand,
            ReplayLocalRecordOnNamesakeCommand,
            ReplayLocalRecordOnActiveCommand,
        ]).forEach((command) => this._commandSrv.registerCommand(command));
    }

    private _initUI(): void {
        this._uiPartsSrv.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(RecorderPanel, this._injector));
        this._componentManager.register('RecordSingle', RecordSingle);
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initSheetsCommands(): void {
        ([
            // InsertColCommand,
            // InsertRowCommand,
            // #region basic commands
            CopySheetCommand,
            DeleteRangeMoveLeftCommand,
            DeleteRangeMoveUpCommand,
            DeltaColumnWidthCommand,
            DeltaRowHeightCommand,
            InsertSheetCommand,
            InsertColAfterCommand,
            InsertColBeforeCommand,
            InsertRowAfterCommand,
            InsertRowBeforeCommand,
            RemoveSheetCommand,
            SetStyleCommand,
            AddWorksheetMergeCommand,
            AddWorksheetMergeAllCommand,
            AddWorksheetMergeVerticalCommand,
            AddWorksheetMergeHorizontalCommand,
            // ResetBackgroundColorCommand,
            // ResetTextColorCommand,
            // SetBackgroundColorCommand,
            // SetBoldCommand,
            // SetFontFamilyCommand,
            // SetFontSizeCommand,
            SetFrozenCommand,
            CancelFrozenCommand,
            SetHorizontalTextAlignCommand,
            // SetItalicCommand,
            SetOverlineCommand,
            SetRangeBoldCommand,
            SetRangeFontFamilyCommand,
            SetRangeFontSizeCommand,
            SetRangeItalicCommand,
            SetRangeStrickThroughCommand,
            SetRangeSubscriptCommand,
            SetRangeSuperscriptCommand,
            SetRangeTextColorCommand,
            SetRangeUnderlineCommand,
            SetRangeValuesCommand,
            SetStrikeThroughCommand,
            SetTextColorCommand,
            SetTextRotationCommand,
            SetTextWrapCommand,
            // SetUnderlineCommand,
            SetVerticalTextAlignCommand,
            SheetCopyCommand,
            SheetCutCommand,
            SheetPasteBesidesBorderCommand,
            SheetPasteColWidthCommand,
            SheetPasteCommand,
            SheetPasteFormatCommand,
            SheetPasteShortKeyCommand,
            SheetPasteValueCommand,
            AutoFillCommand,
            RefillCommand,

            SetWorksheetActivateCommand,
            SetWorksheetActiveOperation,
            SetSelectionsOperation,
            // #endregion

            // #region data validation command
            // #endregion

            // #region conditional formatting command
            // #endregion

            // #region filter command
            SetSheetFilterRangeCommand,
            SetSheetsFilterCriteriaCommand,
            RemoveSheetFilterCommand,
            // #endregion
        ]).forEach((command) => this._actionRecorderService.registerRecordedCommand(command));
    }

    private _initDocsCommands(): void {
        // TODO
    }
}
