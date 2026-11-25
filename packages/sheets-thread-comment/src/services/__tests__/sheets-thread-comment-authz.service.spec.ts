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

import type { IThreadCommentAuthzTarget } from '@univerjs/thread-comment';
import { Injector, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import {
    RangeProtectionPermissionViewPoint,
    SheetPermissionCheckController,
    WorkbookCommentPermission,
    WorkbookViewPermission,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import {
    IThreadCommentAuthzService,
    serializeThreadCommentAnchor,
    ThreadCommentAnchorKind,
    ThreadCommentAuthzService,
} from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { SheetsThreadCommentAuthz } from '../sheets-thread-comment-authz.service';

function createTarget(overrides: Partial<IThreadCommentAuthzTarget> = {}): IThreadCommentAuthzTarget {
    return {
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        ref: 'B2',
        personId: 'author-1',
        ...overrides,
    };
}

function createTestBed(result: { withoutRange?: boolean; withRanges?: boolean } = {}) {
    const permissionCheck = {
        permissionCheckWithoutRange: vi.fn(() => result.withoutRange ?? true),
        permissionCheckWithRanges: vi.fn(() => result.withRanges ?? true),
    };
    const injector = new Injector([
        [IUniverInstanceService, { useValue: { getUnitType: () => UniverInstanceType.UNIVER_SHEET } as never }],
        [UserManagerService],
        [SheetPermissionCheckController, { useValue: permissionCheck as never }],
        [IThreadCommentAuthzService, { useClass: ThreadCommentAuthzService }],
        [SheetsThreadCommentAuthz],
    ]);

    injector.get(SheetsThreadCommentAuthz);

    return {
        authzService: injector.get(IThreadCommentAuthzService),
        permissionCheck,
    };
}

describe('SheetsThreadCommentAuthz', () => {
    it('reads comments with the workbook view permission', () => {
        const { authzService, permissionCheck } = createTestBed();

        expect(authzService.canRead(createTarget())).toBe(true);
        expect(permissionCheck.permissionCheckWithRanges).toHaveBeenCalledWith({
            workbookTypes: [WorkbookViewPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        }, [{ startRow: 1, startColumn: 1, endRow: 1, endColumn: 1 }], 'unit-1', 'sheet-1');
    });

    it('writes comments with the workbook comment permission', () => {
        const { authzService, permissionCheck } = createTestBed();

        expect(authzService.canWrite('add', createTarget())).toBe(true);
        expect(permissionCheck.permissionCheckWithRanges).toHaveBeenLastCalledWith({
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        }, [{ startRow: 1, startColumn: 1, endRow: 1, endColumn: 1 }], 'unit-1', 'sheet-1');
    });

    it('checks drawing comments without building a cell range', () => {
        const { authzService, permissionCheck } = createTestBed();

        const ref = serializeThreadCommentAnchor({
            kind: ThreadCommentAnchorKind.SHEET_DRAWING,
            elementId: 'drawing-1',
        });
        expect(authzService.canWrite('add', createTarget({ ref }))).toBe(true);
        expect(permissionCheck.permissionCheckWithoutRange).toHaveBeenCalledWith({
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission],
        }, 'unit-1', 'sheet-1');
        expect(permissionCheck.permissionCheckWithRanges).not.toHaveBeenCalled();
    });

    it('falls back to a workbook check when the target has no cell reference', () => {
        const { authzService, permissionCheck } = createTestBed();

        expect(authzService.canRead(createTarget({ ref: '' }))).toBe(true);
        expect(permissionCheck.permissionCheckWithoutRange).toHaveBeenCalledWith({
            workbookTypes: [WorkbookViewPermission],
            worksheetTypes: [WorksheetViewPermission],
        }, 'unit-1', 'sheet-1');
        expect(permissionCheck.permissionCheckWithRanges).not.toHaveBeenCalled();
    });

    it('refuses writes when the permission check fails', () => {
        const { authzService } = createTestBed({ withRanges: false });

        expect(authzService.canWrite('update', createTarget())).toBe(false);
        expect(authzService.canRead(createTarget())).toBe(false);
    });
});
