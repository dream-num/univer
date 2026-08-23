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
import { ThreadCommentAnchorKind } from '@univerjs/thread-comment';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ThreadCommentDraftService } from '../thread-comment-draft.service';

describe('ThreadCommentDraftService', () => {
    it('moves from placement mode to an anchored draft and can cancel', () => {
        const injector = new Injector();
        const unitDisposed$ = new Subject<{ getUnitId: () => string }>();
        const currentUser$ = new BehaviorSubject({ userID: 'user-1', name: 'User 1' });
        injector.add([IUniverInstanceService, { useValue: { unitDisposed$ } as never }]);
        injector.add([UserManagerService, {
            useValue: {
                currentUser$,
                getCurrentUser: () => currentUser$.value,
            } as never,
        }]);
        injector.add([ThreadCommentDraftService]);
        const service = injector.get(ThreadCommentDraftService);
        service.startPlacement(UniverInstanceType.UNIVER_BOARD);
        expect(service.placementType).toBe(UniverInstanceType.UNIVER_BOARD);

        service.place({
            unitId: 'board-1',
            subUnitId: 'page-1',
            anchor: { kind: ThreadCommentAnchorKind.BOARD_POSITION, x: 10, y: 20 },
        });
        expect(service.placementType).toBeNull();
        expect(service.draft?.anchor).toEqual({ kind: ThreadCommentAnchorKind.BOARD_POSITION, x: 10, y: 20 });

        unitDisposed$.next({ getUnitId: () => 'other-board' });
        expect(service.draft).not.toBeNull();
        unitDisposed$.next({ getUnitId: () => 'board-1' });
        expect(service.draft).toBeNull();

        service.place({
            unitId: 'board-2',
            subUnitId: 'page-1',
            anchor: { kind: ThreadCommentAnchorKind.BOARD_POSITION, x: 1, y: 2 },
        });
        currentUser$.next({ userID: 'user-2', name: 'User 2' });
        expect(service.draft).toBeNull();

        service.cancel();
        expect(service.draft).toBeNull();
        injector.dispose();
    });
});
