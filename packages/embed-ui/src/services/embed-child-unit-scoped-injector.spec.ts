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

import type { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { ICommandService as ICommandServiceIdentifier, Inject, Injector, IUniverInstanceService as IUniverInstanceServiceIdentifier, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createEmbedChildUnitScopedInjector, createEmbedScopedInjector } from './embed-child-unit-scoped-injector';

class ParentService {
    disposed = false;

    dispose(): void {
        this.disposed = true;
    }
}

class ChildService {
    disposed = false;

    constructor(readonly parent: ParentService) {}

    dispose(): void {
        this.disposed = true;
    }
}

class CreatedWithParentService {
    constructor(
        @Inject(ParentService) readonly parent: ParentService
    ) {}
}

describe('createEmbedScopedInjector', () => {
    it('does not dispose parent fallback services when disposing a child scope', () => {
        const parentInjector = new Injector([
            [ParentService, { useClass: ParentService }],
        ]);
        const parentService = parentInjector.get(ParentService);
        const scopedInjector = createEmbedScopedInjector(parentInjector, new Map());
        const childInjector = scopedInjector.createChild();

        childInjector.add([
            ChildService,
            {
                useFactory: () => new ChildService(childInjector.get(ParentService)),
            },
        ]);
        const childService = childInjector.get(ChildService);

        childInjector.dispose();

        expect(childService.disposed).toBe(true);
        expect(parentService.disposed).toBe(false);
    });

    it('does not dispose parent fallback services resolved while creating scoped instances', () => {
        const parentInjector = new Injector([
            [ParentService, { useClass: ParentService }],
        ]);
        const parentService = parentInjector.get(ParentService);
        const scopedInjector = createEmbedScopedInjector(parentInjector, new Map());

        const created = scopedInjector.createInstance(CreatedWithParentService);

        expect(created.parent).toBe(parentService);

        scopedInjector.dispose();

        expect(parentService.disposed).toBe(false);
    });

    it('does not dispose local override values owned by the embed scope', () => {
        const parentService = new ParentService();
        const commandLikeProxy = new Proxy(parentService, {
            get(target, property, receiver) {
                return Reflect.get(target, property, receiver);
            },
        });
        const parentInjector = new Injector([
            [ParentService, { useValue: parentService }],
        ]);
        const scopedInjector = createEmbedScopedInjector(parentInjector, new Map([
            [ParentService, commandLikeProxy],
        ]));

        const created = scopedInjector.createInstance(CreatedWithParentService);

        expect(created.parent).toBe(commandLikeProxy);

        scopedInjector.dispose();

        expect(parentService.disposed).toBe(false);
    });
});

describe('createEmbedChildUnitScopedInjector', () => {
    it('keeps child current and focus writes local to the scoped runtime', () => {
        const childUnit = {
            type: UniverInstanceType.UNIVER_SLIDE,
            getUnitId: () => 'child-slide',
        };
        const instanceService = {
            getUnit: vi.fn((unitId: string) => unitId === 'child-slide' ? childUnit : null),
            getCurrentUnitOfType: vi.fn(() => null),
            getCurrentTypeOfUnit$: vi.fn(),
            getFocusedUnit: vi.fn(() => null),
            focused$: undefined,
            focusUnit: vi.fn(),
            setCurrentUnitForType: vi.fn(),
        } as unknown as IUniverInstanceService;
        const commandService = {
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn(),
        } as unknown as ICommandService;
        const injector = new Injector([
            [IUniverInstanceServiceIdentifier, { useValue: instanceService }],
            [ICommandServiceIdentifier, { useValue: commandService }],
        ]);

        const scopedInjector = createEmbedChildUnitScopedInjector({
            injector,
            childUnitId: 'child-slide',
            childType: UniverInstanceType.UNIVER_SLIDE,
        } as never);
        const scopedInstanceService = scopedInjector!.get(IUniverInstanceServiceIdentifier);

        scopedInstanceService.focusUnit('child-slide');
        scopedInstanceService.setCurrentUnitForType('child-slide');

        expect(instanceService.focusUnit).not.toHaveBeenCalled();
        expect(instanceService.setCurrentUnitForType).not.toHaveBeenCalled();
        expect(scopedInstanceService.getFocusedUnit()).toBe(childUnit);
        expect(scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SLIDE)).toBe(childUnit);
    });
});
