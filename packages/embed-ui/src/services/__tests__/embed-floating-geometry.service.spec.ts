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

/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import { EmbedFloatingGeometryService } from '../embed-floating-geometry.service';

describe('EmbedFloatingGeometryService', () => {
    it('tracks registrations and emits invalidations', () => {
        const service = new EmbedFloatingGeometryService();
        const root = document.createElement('div');
        const viewport = document.createElement('div');
        const events: unknown[] = [];
        const subscription = service.geometryInvalidated$.subscribe((event) => events.push(event));

        const disposable = service.register({
            embedId: 'embed-1',
            root,
            viewport,
        });

        expect(service.getRegistration('embed-1')).toEqual({ embedId: 'embed-1', root, viewport });
        expect(events).toEqual([{ embedId: 'embed-1', reason: 'manual' }]);

        service.invalidate({ embedId: 'embed-1', reason: 'host-scroll' });
        expect(events.at(-1)).toEqual({ embedId: 'embed-1', reason: 'host-scroll' });

        disposable.dispose();
        expect(service.getRegistration('embed-1')).toBeUndefined();
        expect(events.at(-1)).toEqual({ embedId: 'embed-1', reason: 'manual' });

        subscription.unsubscribe();
    });
});
