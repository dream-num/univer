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

import type { IUnitPresenceUIAdapter } from '../unit-presence-ui-adapter.service';
import { Injector, UniverInstanceType } from '@univerjs/core';
import { NEVER, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import {
    IUnitPresenceUIAdapterRegistry,
    UnitPresenceUIAdapterRegistry,
} from '../unit-presence-ui-adapter.service';

function createRegistry() {
    const injector = new Injector();
    injector.add([IUnitPresenceUIAdapterRegistry, { useClass: UnitPresenceUIAdapterRegistry }]);
    return {
        injector,
        registry: injector.get(IUnitPresenceUIAdapterRegistry),
    };
}

function createAdapter(unitType: UniverInstanceType): IUnitPresenceUIAdapter {
    return {
        unitType,
        presenceKind: `unit-presence-${unitType}`,
        active$: of(false),
        localPresence$: NEVER,
        activate: () => ({ dispose: () => undefined }),
        isActive: () => false,
        getLocalPresence: () => null,
        getRemotePresences$: () => NEVER,
        setRemotePresence: () => undefined,
        removeRemotePresence: () => undefined,
        clearRemotePresences: () => undefined,
    };
}

describe('UnitPresenceUIAdapterRegistry', () => {
    it('registers and disposes adapters while publishing immutable snapshots', () => {
        const { injector, registry } = createRegistry();
        const snapshots: Array<readonly IUnitPresenceUIAdapter[]> = [];
        const subscription = registry.adapters$.subscribe((adapters) => snapshots.push(adapters));
        const adapter = createAdapter(UniverInstanceType.UNIVER_BOARD);

        const disposable = registry.register(adapter);

        expect(registry.get(UniverInstanceType.UNIVER_BOARD)).toBe(adapter);
        expect(registry.getAll()).toEqual([adapter]);
        expect(Object.isFrozen(registry.getAll())).toBe(true);

        disposable.dispose();

        expect(registry.get(UniverInstanceType.UNIVER_BOARD)).toBeNull();
        expect(registry.getAll()).toEqual([]);
        expect(snapshots).toHaveLength(3);
        subscription.unsubscribe();
        injector.dispose();
    });

    it('rejects duplicate host registrations', () => {
        const { injector, registry } = createRegistry();
        registry.register(createAdapter(UniverInstanceType.UNIVER_SLIDE));

        expect(() => registry.register(createAdapter(UniverInstanceType.UNIVER_SLIDE)))
            .toThrow('A unit presence adapter is already registered');
        injector.dispose();
    });
});
