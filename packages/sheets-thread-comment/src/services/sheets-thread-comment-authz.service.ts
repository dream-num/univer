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

import type { IThreadCommentAuthz, IThreadCommentAuthzTarget, ThreadCommentWriteAction } from '@univerjs/thread-comment';
import { Disposable, Inject, UniverInstanceType } from '@univerjs/core';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import {
    RangeProtectionPermissionViewPoint,
    SheetPermissionCheckController,
    WorkbookCommentPermission,
    WorkbookViewPermission,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import {
    deserializeThreadCommentAnchor,
    IThreadCommentAuthzService,
    ThreadCommentAnchorKind,
} from '@univerjs/thread-comment';

/**
 * Sheets comment permissions: reading requires view permission, writing requires
 * the workbook comment permission. Both are also limited by range protection.
 */
export class SheetsThreadCommentAuthz extends Disposable implements IThreadCommentAuthz {
    constructor(
        @Inject(SheetPermissionCheckController) private readonly _permissionCheckController: SheetPermissionCheckController,
        @Inject(IThreadCommentAuthzService) private readonly _authzService: IThreadCommentAuthzService
    ) {
        super();

        this.disposeWithMe(this._authzService.registerAuthz(UniverInstanceType.UNIVER_SHEET, this));
    }

    canRead(target: IThreadCommentAuthzTarget): boolean {
        return this._checkPermission(target, false);
    }

    canWrite(_action: ThreadCommentWriteAction, target: IThreadCommentAuthzTarget): boolean {
        return this._checkPermission(target, true);
    }

    private _checkPermission(target: IThreadCommentAuthzTarget, write: boolean): boolean {
        const { unitId, subUnitId, ref } = target;
        const permissionTypes = write
            ? { workbookTypes: [WorkbookCommentPermission], worksheetTypes: [WorksheetViewPermission] }
            : { workbookTypes: [WorkbookViewPermission], worksheetTypes: [WorksheetViewPermission] };

        if (ref) {
            const anchor = deserializeThreadCommentAnchor(ref);
            if (anchor?.kind !== ThreadCommentAnchorKind.SHEET_DRAWING) {
                const { row, column } = singleReferenceToGrid(ref);
                if (Number.isFinite(row) && Number.isFinite(column)) {
                    return this._permissionCheckController.permissionCheckWithRanges(
                        { ...permissionTypes, rangeTypes: [RangeProtectionPermissionViewPoint] },
                        [{ startRow: row, startColumn: column, endRow: row, endColumn: column }],
                        unitId,
                        subUnitId
                    );
                }
            }
        }

        return this._permissionCheckController.permissionCheckWithoutRange(permissionTypes, unitId, subUnitId);
    }
}
