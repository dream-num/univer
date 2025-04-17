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

import { ILogService } from '@univerjs/core';
import { BuiltInUIPart } from '@univerjs/ui';
import { ButtonRangeSelector } from './button';

// eslint-disable-next-line max-lines-per-function, complexity
export function initEvent() {
    const logService = window.univer!.__getInjector().get(ILogService);

    // Workbook Events
    window.univerAPI?.addEvent(window.univerAPI.Event.WorkbookCreated, (params) => {
        logService.log('===WorkbookCreated', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.WorkbookDisposed, (params) => {
        logService.log('===WorkbookDisposed', params);
    });

    // Sheet Lifecycle Events
    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetCreate, (params) => {
        logService.log('===BeforeSheetCreate', params);
    });
    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetCreated, (params) => {
        logService.log('===SheetCreated', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetDelete, (params) => {
        logService.log('===BeforeSheetDelete', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetDeleted, (params) => {
        logService.log('===SheetDeleted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetMove, (params) => {
        logService.log('===BeforeSheetMove', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetMoved, (params) => {
        logService.log('===SheetMoved', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetNameChange, (params) => {
        logService.log('===BeforeSheetNameChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetNameChanged, (params) => {
        logService.log('===SheetNameChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetHideChange, (params) => {
        logService.log('===BeforeSheetHideChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetHideChanged, (params) => {
        logService.log('===SheetHideChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellClicked, (params) => {
        logService.log('===CellClicked', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellHover, (params) => {
        logService.log('===CellHover', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellPointerDown, (params) => {
        logService.log('===CellPointerDown', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellPointerUp, (params) => {
        logService.log('===CellPointerUp', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CellPointerMove, (params) => {
        logService.log('===CellPointerMove', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionChanged, (params) => {
        logService.log('===SelectionChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionMoveStart, (params) => {
        logService.log('===SelectionMoveStart', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionMoveEnd, (params) => {
        logService.log('===SelectionMoveEnd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SelectionMoving, (params) => {
        logService.log('===SelectionMoving', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetEditStart, (params) => {
        logService.log('===BeforeSheetEditStart', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditStarted, (params) => {
        logService.log('===SheetEditStarted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditChanging, (params) => {
        logService.log('===SheetEditChanging', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetEditEnd, (params) => {
        logService.log('===BeforeSheetEditEnd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditEnded, (params) => {
        logService.log('===SheetEditEnded', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetValueChanged, (params) => {
        logService.log('===SheetValueChanged', params);
    });

    // Clipboard Events
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeClipboardChange, (params) => {
        logService.log('===BeforeClipboardChange', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.ClipboardChanged, (params) => {
        logService.log('===ClipboardChanged', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeClipboardPaste, (params) => {
        logService.log('===BeforeClipboardPaste', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.ClipboardPasted, (params) => {
        logService.log('===ClipboardPasted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeGridlineEnableChange, (params) => {
        logService.log('===BeforeGridlineEnableChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeGridlineColorChange, (params) => {
        logService.log('===BeforeGridlineColorChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.GridlineChanged, (params) => {
        logService.log('===GridlineChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetZoomChange, (params) => {
        logService.log('===BeforeSheetZoomChange', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetZoomChanged, (params) => {
        logService.log('===SheetZoomChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.Scroll, (params) => {
        logService.log('===Scroll', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetSkeletonChanged, (params) => {
        logService.log('===SheetSkeletonChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetDataValidationAdd, (params) => {
        logService.log('===BeforeSheetDataValidationAdd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetDataValidationChanged, (params) => {
        logService.log('===SheetDataValidationChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetDataValidatorStatusChanged, (params) => {
        logService.log('===SheetDataValidatorStatusChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetBeforeRangeFilter, (params) => {
        logService.log('===SheetBeforeRangeFilter', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetRangeFiltered, (params) => {
        logService.log('===SheetRangeFiltered', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetBeforeRangeSort, (params) => {
        logService.log('===SheetBeforeRangeSort', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetRangeSorted, (params) => {
        logService.log('===SheetRangeSorted', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.SheetBeforeRangeFilterClear, (params) => {
        logService.log('===SheetBeforeRangeFilterClear', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.SheetRangeFilterCleared, (params) => {
        logService.log('===SheetRangeFilterCleared', params);
    });

    // Image Events
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageInsert, (params) => {
        logService.log('===BeforeOverGridImageInsert', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageInserted, (params) => {
        logService.log('===OverGridImageInserted', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageChange, (params) => {
        logService.log('===BeforeOverGridImageChange', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageChanged, (params) => {
        logService.log('===OverGridImageChanged', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageRemove, (params) => {
        logService.log('===BeforeOverGridImageRemove', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageRemoved, (params) => {
        logService.log('===OverGridImageRemoved', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeOverGridImageSelect, (params) => {
        logService.log('===BeforeOverGridImageSelect', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.OverGridImageSelected, (params) => {
        logService.log('===OverGridImageSelected', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentAdd, (params) => {
        logService.log('===BeforeCommentAdd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentAdded, (params) => {
        logService.log('===CommentAdded', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentUpdate, (params) => {
        logService.log('===BeforeCommentUpdate', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentUpdated, (params) => {
        logService.log('===CommentUpdated', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentDelete, (params) => {
        logService.log('===BeforeCommentDelete', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentDeleted, (params) => {
        logService.log('===CommentDeleted', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeCommentResolve, (params) => {
        logService.log('===BeforeCommentResolve', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CommentResolved, (params) => {
        logService.log('===CommentResolved', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderClick, (params) => {
        logService.log('===RowHeaderClick', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderHover, (params) => {
        logService.log('===RowHeaderHover', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderPointerDown, (params) => {
        logService.log('===RowHeaderPointerDown', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.RowHeaderPointerUp, (params) => {
        logService.log('===RowHeaderPointerUp', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderClick, (params) => {
        logService.log('===ColumnHeaderClick', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderHover, (params) => {
        logService.log('===ColumnHeaderHover', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderPointerDown, (params) => {
        logService.log('===ColumnHeaderPointerDown', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ColumnHeaderPointerUp, (params) => {
        logService.log('===ColumnHeaderPointerUp', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetLinkAdd, (params) => {
        logService.log('===BeforeSheetLinkAdd', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetLinkUpdate, (params) => {
        logService.log('===BeforeSheetLinkUpdate', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetLinkCancel, (params) => {
        logService.log('===BeforeSheetLinkCancel', params);
    });

    // Drag and Drop Events
    window.univerAPI?.addEvent(window.univerAPI.Event.DragOver, (params) => {
        logService.log('===DragOver', params);
    });

    window.univerAPI?.addEvent(window.univerAPI.Event.Drop, (params) => {
        logService.log('===Drop', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CrosshairHighlightColorChanged, (params) => {
        logService.log('===CrosshairHighlightColorChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.CrosshairHighlightEnabledChanged, (params) => {
        logService.log('===CrosshairHighlightEnabledChanged', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.BeforeSheetEditStart, (params) => {
        const { row, column } = params;
        if (row === 0 && column === 0) {
            params.cancel = true;
        }
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.ActiveSheetChanged, (params) => {
        logService.log('===active sheet changed', params);
    });

    // checked
    window.univerAPI?.addEvent(window.univerAPI.Event.SheetEditChanging, (params) => {
        logService.log('===SheetEditChanging', params);
    });
}

// initEvent();
export function initFacadeBtns() {
    window.univerAPI?.registerUIPart(BuiltInUIPart.CUSTOM_HEADER, ButtonRangeSelector);
}

// setTimeout(() => {
//     const active = window.univerAPI?.getActiveSheet();
//     console.log('==active', active, window.univerAPI);
//     if (!active) {
//         return;
//     }

//     window.univerAPI?.showRangeSelectorDialog({
//         unitId: active.workbook.getId(),
//         subUnitId: active.worksheet.getSheetId(),
//         callback: (ranges, isCancel) => {
//             console.log('===range selector dialog result', ranges, isCancel);
//         },
//     });
// }, 5000);
