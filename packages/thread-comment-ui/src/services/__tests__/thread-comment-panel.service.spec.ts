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

import type { ISidebarMethodOptions } from '@univerjs/ui';
import { Injector, IUniverInstanceService } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreadCommentPanelService } from '../thread-comment-panel.service';

describe('ThreadCommentPanelService', () => {
    let service: ThreadCommentPanelService;
    let sidebarOptions$: Subject<ISidebarMethodOptions>;

    beforeEach(() => {
        sidebarOptions$ = new Subject();
        const injector = new Injector();
        injector.add([ISidebarService, { useValue: { sidebarOptions$, close: vi.fn() } as unknown as ISidebarService }]);
        injector.add([IUniverInstanceService, { useValue: { getCurrentTypeOfUnit$: () => of({}) } as unknown as IUniverInstanceService }]);
        injector.add([ThreadCommentPanelService]);
        service = injector.get(ThreadCommentPanelService);
    });

    it('hides the comment panel when the host sidebar closes', () => {
        const visibleStates: boolean[] = [];
        service.panelVisible$.subscribe((visible) => visibleStates.push(visible));

        service.setPanelVisible(true);
        sidebarOptions$.next({ visible: false });

        expect(service.panelVisible).toBe(false);
        expect(visibleStates).toEqual([false, true, false]);
    });

    it('publishes the active thread comment selected by the user', () => {
        const activeComments: unknown[] = [];
        service.activeCommentId$.subscribe((comment) => activeComments.push(comment));

        service.setActiveComment({ unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'c-1', trigger: 'cell' });

        expect(service.activeCommentId).toEqual({ unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'c-1', trigger: 'cell' });
        expect(activeComments.at(-1)).toEqual({ unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'c-1', trigger: 'cell' });
    });
});
