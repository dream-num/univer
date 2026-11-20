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

import { Injector, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import type { IThreadCommentAuthz, IThreadCommentAuthzTarget } from '../tc-authz.service';
import { IThreadCommentAuthzService, ThreadCommentAuthzService } from '../tc-authz.service';

function createTarget(overrides: Partial<IThreadCommentAuthzTarget> = {}): IThreadCommentAuthzTarget {
    return {
        unitId: 'unit-1',
        subUnitId: 'sub-unit-1',
        ref: 'A1',
        personId: 'author-1',
        ...overrides,
    };
}

function createTestBed(unitType: UniverInstanceType = UniverInstanceType.UNIVER_SHEET) {
    const injector = new Injector([
        [IUniverInstanceService, { useValue: { getUnitType: () => unitType } as never }],
        [UserManagerService],
        [IThreadCommentAuthzService, { useClass: ThreadCommentAuthzService }],
    ]);

    return {
        injector,
        authzService: injector.get(IThreadCommentAuthzService),
        userManagerService: injector.get(UserManagerService),
    };
}

function createAuthz(overrides: Partial<IThreadCommentAuthz> = {}): IThreadCommentAuthz {
    return {
        canRead: vi.fn(() => true),
        canWrite: vi.fn(() => true),
        ...overrides,
    };
}

describe('ThreadCommentAuthzService', () => {
    it('keeps platform rules unrestricted when no platform authz is registered', () => {
        const { authzService, userManagerService } = createTestBed();
        const target = createTarget();
        userManagerService.setCurrentUser({ userID: 'author-1', name: 'Author' });

        expect(authzService.canRead(target)).toBe(true);
        expect(authzService.canWrite('add', target)).toBe(true);
        expect(authzService.canWrite('delete', target)).toBe(true);
    });

    it('dispatches to the authz registered for the unit type', () => {
        const { authzService } = createTestBed(UniverInstanceType.UNIVER_SHEET);
        const docAuthz = createAuthz({ canWrite: vi.fn(() => false) });
        authzService.registerAuthz(UniverInstanceType.UNIVER_DOC, docAuthz);

        // A sheet comment is unaffected by the document implementation.
        expect(authzService.canWrite('add', createTarget())).toBe(true);
        expect(docAuthz.canWrite).not.toHaveBeenCalled();

        const sheetAuthz = createAuthz({ canWrite: vi.fn(() => false) });
        authzService.registerAuthz(UniverInstanceType.UNIVER_SHEET, sheetAuthz);
        expect(authzService.canWrite('add', createTarget())).toBe(false);
        expect(sheetAuthz.canWrite).toHaveBeenCalledTimes(1);
    });

    it('removes a registered authz when its registration is disposed', () => {
        const { authzService } = createTestBed();
        const registration = authzService.registerAuthz(
            UniverInstanceType.UNIVER_SHEET,
            createAuthz({ canWrite: vi.fn(() => false) })
        );

        expect(authzService.canWrite('add', createTarget())).toBe(false);
        registration.dispose();
        expect(authzService.canWrite('add', createTarget())).toBe(true);
    });

    it('allows only the author to update or delete a comment', () => {
        const { authzService, userManagerService } = createTestBed();
        userManagerService.setCurrentUser({ userID: 'author-1', name: 'Author' });

        expect(authzService.canWrite('update', createTarget())).toBe(true);
        expect(authzService.canWrite('delete', createTarget())).toBe(true);
        expect(authzService.canWrite('update', createTarget({ personId: 'author-2' }))).toBe(false);
        expect(authzService.canWrite('delete', createTarget({ personId: 'author-2' }))).toBe(false);
    });

    it('keeps resolving and replying open to non-authors', () => {
        const { authzService, userManagerService } = createTestBed();
        userManagerService.setCurrentUser({ userID: 'author-1', name: 'Author' });
        const target = createTarget({ personId: 'author-2' });

        expect(authzService.canWrite('resolve', target)).toBe(true);
        expect(authzService.canWrite('reply', target)).toBe(true);
        expect(authzService.canWrite('add', target)).toBe(true);
    });

    it('matches comments with the same identity when the host has not identified the current user', () => {
        const { authzService } = createTestBed();

        expect(authzService.canWrite('update', createTarget({ personId: '' }))).toBe(true);
        expect(authzService.canWrite('update', createTarget({ personId: 'anonymous-author' }))).toBe(false);
    });

    it('still applies platform rules to the author of a comment', () => {
        const { authzService, userManagerService } = createTestBed();
        userManagerService.setCurrentUser({ userID: 'author-1', name: 'Author' });
        authzService.registerAuthz(
            UniverInstanceType.UNIVER_SHEET,
            createAuthz({ canWrite: vi.fn(() => false) })
        );

        expect(authzService.canWrite('update', createTarget())).toBe(false);
    });
});
