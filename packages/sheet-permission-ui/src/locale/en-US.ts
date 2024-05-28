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

const locale = {
    permission: {
        toolbarMenu: 'Protection',
        panel: {
            title: 'Protect Rows and Columns',
            name: 'Name',
            protectedRange: 'Protected Range',
            permissionDirection: 'Permission Description',
            permissionDirectionPlaceholder: 'Enter permission description',
            editPermission: 'Edit Permissions',
            onlyICanEdit: 'Only I can edit',
            designedUserCanEdit: 'Specified users can edit',
            viewPermission: 'View Permissions',
            othersCanView: 'Others can view',
            noOneElseCanView: 'No one else can view',
            designedPerson: 'Specified persons',
            addPerson: 'Add person',
            canEdit: 'Can edit',
            canView: 'Can view',
            delete: 'Delete',
            currentSheet: 'Current worksheet',
            allSheet: 'All worksheets',
            edit: 'Edit',
            Print: 'Print',
            Comment: 'Comment',
            Copy: 'Copy',
            SetCellStyle: 'Set cell style',
            SetCellValue: 'Set cell value',
            SetHyperLink: 'Set hyperlink',
            Sort: 'Sort',
            Filter: 'Filter',
            PivotTable: 'Pivot table',
            FloatImage: 'Float image',
            RowHeightColWidth: 'Row height and column width',
            RowHeightColWidthReadonly: 'Read-only row height and column width',
            FilterReadonly: 'Read-only filter',
            nameError: 'Name cannot be empty',
            created: 'Created',
            iCanEdit: 'I can edit',
            iCanNotEdit: 'I can\'t edit',
            iCanView: 'I can view',
            iCanNotView: 'I can\'t view',
            emptyRangeError: 'Range cannot be empty',
            rangeOverlapError: 'Range cannot overlap',
            rangeOverlapOverPermissionError: 'Range cannot overlap with the range that has the same permission',
            InsertHyperlink: 'Insert hyperlink',
            SetRowStyle: 'Set row style',
            SetColumnStyle: 'Set column style',
            InsertColumn: 'Insert column',
            InsertRow: 'Insert row',
            DeleteRow: 'Delete row',
            DeleteColumn: 'Delete column',
            EditExtraObject: 'Edit extra object',
        },
        dialog: {
            allowUserToEdit: 'Allow user to edit',
            allowedPermissionType: 'Allowed permission types',
            setCellValue: 'Set cell value',
            setCellStyle: 'Set cell style',
            copy: 'Copy',
            alert: 'Alert',
            alertContent: 'This range has been protected and no editing permissions are currently available. If you need to edit, please contact the creator.',
            userEmpty: 'no designated person , Share link to invite specific people.',
            listEmpty: 'You haven\'t set up any ranges or sheets as protected.',
            commonErr: 'The range is protected, and you do not have permission for this operation. To edit, please contact the creator.',
            editErr: 'The range is protected, and you do not have edit permission. To edit, please contact the creator.',
            pasteErr: 'The range is protected, and you do not have paste permission. To paste, please contact the creator.',
            setStyleErr: 'The range is protected, and you do not have permission to set styles. To set styles, please contact the creator.',
            copyErr: 'The range is protected, and you do not have copy permission. To copy, please contact the creator.',
            setRowColStyleErr: 'The range is protected, and you do not have permission to set row and column styles. To set row and column styles, please contact the creator.',
            moveRowColErr: 'The range is protected, and you do not have permission to move rows and columns. To move rows and columns, please contact the creator.',
            moveRangeErr: 'The range is protected, and you do not have permission to move the selection. To move the selection, please contact the creator.',
            autoFillErr: 'The range is protected, and you do not have permission for auto-fill. To use auto-fill, please contact the creator.',
            filterErr: 'The range is protected, and you do not have filtering permission. To filter, please contact the creator.',
            operatorSheetErr: 'The worksheet is protected, and you do not have permission to operate the worksheet. To operate the worksheet, please contact the creator.',
            insertOrDeleteMoveRangeErr: 'The inserted or deleted range intersects with the protected range, and this operation is not supported for now.',
            printErr: 'The worksheet is protected, and you do not have permission to print. To print, please contact the creator.',
        },
        button: {
            confirm: 'Confirm',
            cancel: 'Cancel',
            addNewPermission: 'Add new permission',
        },
    },
};

export default locale;
