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

const locale = {
    sheets: {
        tabs: {
            sheetCopy: '(Copy{0})',
            sheet: 'Sheet',
        },
        info: {
            overlappingSelections: 'Cannot use that command on overlapping selections',
            acrossMergedCell: 'Across a merged cell',
            partOfCell: 'Only part of a merged cell is selected',
            hideSheet: 'No visible sheet after you hide this',
        },
        definedName: {
            nameEmpty: 'Name cannot be empty',
            nameDuplicate: 'Name already exists',
            nameInvalid: 'The name is invalid',
            nameSheetConflict: 'The name conflicts with the sheet name',
            formulaOrRefStringEmpty: 'Formula or reference string cannot be empty',
            nameConflict: 'The name conflicts with the function name',
            defaultName: 'DefinedName',
        },
        permission: {
            dialog: {
                autoFillErr: 'The range is protected, and you do not have permission for auto-fill. To use auto-fill, please contact the creator.',
                editErr: 'The range is protected, and you do not have edit permission. To edit, please contact the creator.',
                formulaErr: 'The range or the referenced range is protected, and you do not have edit permission. To edit, please contact the creator.',
                insertOrDeleteMoveRangeErr: 'The inserted or deleted range intersects with the protected range, and this operation is not supported for now.',
                insertRowColErr: 'The range is protected, and you do not have permission to insert rows and columns. To insert rows and columns, please contact the creator.',
                moveRangeErr: 'The range is protected, and you do not have permission to move the selection. To move the selection, please contact the creator.',
                moveRowColErr: 'The range is protected, and you do not have permission to move rows and columns. To move rows and columns, please contact the creator.',
                operatorSheetErr: 'The worksheet is protected, and you do not have permission to operate the worksheet. To operate the worksheet, please contact the creator.',
                removeRowColErr: 'The range is protected, and you do not have permission to delete rows and columns. To delete rows and columns, please contact the creator.',
                setRowColStyleErr: 'The range is protected, and you do not have permission to set row and column styles. To set row and column styles, please contact the creator.',
                setStyleErr: 'The range is protected, and you do not have permission to set styles. To set styles, please contact the creator.',
            },
        },
        autoFill: {
            copy: 'Copy Cell',
            series: 'Fill Series',
            formatOnly: 'Format Only',
            noFormat: 'No Format',
        },
        merge: {
            confirm: {
                title: 'Continue merging would only keep the upper-left cell value, discard other values. Are you sure to continue?',
                cancel: 'Cancel merging',
                confirm: 'Continue merging',
                warning: 'Warning',
                dismantleMergeCellWarning: 'This will cause some merged cells to be split. Do you want to continue?',
            },
        },
    },
};

export default locale;
