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

import type { ICommandInfo } from '@univerjs/core';
import {
    ICommandService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    toDisposable,
} from '@univerjs/core';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import { IThreadCommentAuthzService } from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import {
    AddSheetDrawingCommentOperation,
    ShowAddSheetCommentModalOperation,
    ToggleSheetCommentPanelOperation,
} from '../../commands/operations/comment.operation';
import enUS from '../../locale/en-US';
import { SheetsThreadCommentOperationPermissionController } from '../sheets-thread-comment-operation-permission.controller';

type BeforeCommandHandler = (command: ICommandInfo) => void;

function createTestBed(allowed = true) {
    let beforeCommandHandler: BeforeCommandHandler;
    const authzService = {
        canRead: vi.fn(() => allowed),
        canWrite: vi.fn(() => allowed),
    };
    const permissionCheck = {
        blockExecuteWithoutPermission: vi.fn(),
    };
    const injector = new Injector([
        [ICommandService, { useValue: {
            beforeCommandExecuted: vi.fn((handler: BeforeCommandHandler) => {
                beforeCommandHandler = handler;

                return toDisposable(() => undefined);
            }),
        } as never }],
        [LocaleService],
        [SheetPermissionCheckController, { useValue: permissionCheck as never }],
        [IThreadCommentAuthzService, { useValue: authzService as never }],
        [IUniverInstanceService, { useValue: {
            getCurrentUnitOfType: () => ({
                getUnitId: () => 'unit-1',
                getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
            }),
        } as never }],
        [SheetsThreadCommentOperationPermissionController],
    ]);

    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');

    return {
        authzService,
        execute: (command: ICommandInfo) => beforeCommandHandler(command),
        injector,
        permissionCheck,
    };
}

describe('SheetsThreadCommentOperationPermissionController', () => {
    it('blocks opening the add-comment modal without write permission', () => {
        const bed = createTestBed(false);
        const controller = bed.injector.get(SheetsThreadCommentOperationPermissionController);

        bed.execute({ id: ShowAddSheetCommentModalOperation.id });

        expect(bed.authzService.canWrite).toHaveBeenCalledWith('add', {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ref: '',
        });
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledWith(
            enUS['sheets-thread-comment-ui'].permission.commentErr
        );

        controller.dispose();
    });

    it('blocks adding a drawing comment without write permission', () => {
        const bed = createTestBed(false);
        const controller = bed.injector.get(SheetsThreadCommentOperationPermissionController);

        bed.execute({ id: AddSheetDrawingCommentOperation.id });

        expect(bed.authzService.canWrite).toHaveBeenCalledWith('add', expect.objectContaining({ ref: '' }));
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledTimes(1);

        controller.dispose();
    });

    it('blocks opening the comment panel without read permission', () => {
        const bed = createTestBed(false);
        const controller = bed.injector.get(SheetsThreadCommentOperationPermissionController);

        bed.execute({ id: ToggleSheetCommentPanelOperation.id });

        expect(bed.authzService.canRead).toHaveBeenCalledWith({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ref: '',
        });
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledTimes(1);

        controller.dispose();
    });

    it('does not block the entry points when the authz service allows them', () => {
        const bed = createTestBed(true);
        const controller = bed.injector.get(SheetsThreadCommentOperationPermissionController);

        bed.execute({ id: ShowAddSheetCommentModalOperation.id });
        bed.execute({ id: ToggleSheetCommentPanelOperation.id });

        expect(bed.permissionCheck.blockExecuteWithoutPermission).not.toHaveBeenCalled();

        controller.dispose();
    });
});
