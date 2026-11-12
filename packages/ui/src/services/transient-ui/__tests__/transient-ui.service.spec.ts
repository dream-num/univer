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
import { ITransientUIService, TransientUIService } from '../transient-ui.service';

const injectors: Injector[] = [];
function createService() {
    const injector = new Injector([[ITransientUIService, { useClass: TransientUIService }]]);
    injectors.push(injector);
    return injector.get(ITransientUIService);
}

afterEach(() => injectors.splice(0).forEach((injector) => injector.dispose()));

describe('TransientUIService', () => {
    it('keeps independent host suspensions active until every owner releases them', () => {
        const host = createService();
        const other = createService();
        const dismissed = vi.fn();
        host.dismissed$.subscribe(dismissed);
        const initialRevision = host.revision;
        const history = host.suspend();
        const preview = host.suspend();
        expect(dismissed).toHaveBeenCalledTimes(2);
        expect(host.revision).not.toBe(initialRevision);
        expect(other.suspended).toBe(false);
        history.dispose();
        history.dispose();
        expect(host.suspended).toBe(true);
        preview.dispose();
        expect(host.suspended).toBe(false);
        expect(dismissed).toHaveBeenCalledTimes(2);
    });

    it('invalidates pending interactions without suspending subsequent menu use', () => {
        const service = createService();
        const revision = service.revision;
        const dismissed = vi.fn();
        const subscription = service.dismissed$.subscribe(dismissed);
        service.dismiss();
        expect(service.revision).not.toBe(revision);
        expect(service.suspended).toBe(false);
        expect(dismissed).toHaveBeenCalledOnce();
        subscription.unsubscribe();
        service.dismiss();
        expect(dismissed).toHaveBeenCalledOnce();
    });

    it('closes menus and prevents reopening after its injector is disposed', () => {
        const service = createService();
        const suspension = service.suspend();
        const dismissed = vi.fn();
        const completed = vi.fn();
        service.dismissed$.subscribe({ next: dismissed, complete: completed });
        injectors[0].dispose();
        suspension.dispose();
        expect(service.suspended).toBe(true);
        expect(dismissed).toHaveBeenCalledOnce();
        expect(completed).toHaveBeenCalledOnce();
        expect(() => service.suspend()).toThrow('disposed');
    });
});
