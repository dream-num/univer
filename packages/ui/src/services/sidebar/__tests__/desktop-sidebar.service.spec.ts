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

import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopSidebarService } from '../desktop-sidebar.service';
import { ISidebarService } from '../sidebar.service';

function createService(): ISidebarService {
    const injector = new Injector();
    injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
    return injector.get(ISidebarService);
}

describe('DesktopSidebarService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('opens and closes the requested sidebar panel', () => {
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(1);
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        const service = createService();
        const snapshots: unknown[] = [];
        const opened: string[] = [];
        const closed: string[] = [];
        const sub = service.sidebarOptions$.subscribe((value) => snapshots.push(value));

        service.open({ id: 'inspector', onOpen: () => opened.push('inspector'), onClose: (id) => closed.push(id ?? '') });
        service.close('inspector');

        expect(service.visible).toBe(false);
        expect(opened).toEqual(['inspector']);
        expect(closed).toEqual(['']);
        expect(snapshots).toMatchObject([{ id: 'inspector', visible: true }, { id: 'inspector', visible: false }]);
        sub.unsubscribe();
    });

    it('ignores close requests for a different sidebar id', () => {
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(1);
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        const service = createService();

        service.open({ id: 'inspector' });
        service.close('other');

        expect(service.visible).toBe(true);
    });
});
