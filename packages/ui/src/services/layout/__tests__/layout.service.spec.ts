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

import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    UnitModel,
    UniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopLayoutService, ILayoutService } from '../layout.service';

class TestSlideUnit extends UnitModel {
    override type = UniverInstanceType.UNIVER_SLIDE;
    private readonly _name$ = new BehaviorSubject('');
    override name$ = this._name$.asObservable();

    override getUnitId(): string {
        return 'slide-1';
    }

    override setName(name: string): void {
        this._name$.next(name);
    }

    override getSnapshot(): object {
        return { id: 'slide-1' };
    }

    override getRev(): number {
        return 1;
    }

    override incrementRev(): void {}

    override setRev(): void {}
}

function createElement(name: string, containsSelf = true) {
    return {
        dataset: { uComp: name },
        contains: (target: unknown) => containsSelf && target != null,
    } as unknown as HTMLElement;
}

function createService() {
    vi.stubGlobal('window', new EventTarget());
    vi.stubGlobal('document', { activeElement: null });
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const slide = injector.createInstance(TestSlideUnit);
    univerInstanceService.__addUnit(slide);
    univerInstanceService.focusUnit('slide-1');
    return {
        service: injector.get(ILayoutService),
    };
}

describe('DesktopLayoutService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('tracks registered containers and delegates focus to the focused Univer unit type', () => {
        const { service } = createService();
        const root = createElement('app-layout');
        const content = createElement('workbench-layout');
        const focused: string[] = [];

        const rootDisposable = service.registerRootContainerElement(root);
        const contentDisposable = service.registerContentElement(content);
        const focusDisposable = service.registerFocusHandler(UniverInstanceType.UNIVER_SLIDE, (unitId) => focused.push(unitId));

        expect(service.rootContainerElement).toBe(root);
        expect(service.getContentElement()).toBe(content);
        expect(service.checkElementInCurrentContainers(content)).toBe(true);

        service.focus();
        expect(focused).toEqual(['slide-1']);

        focusDisposable.dispose();
        contentDisposable.dispose();
        rootDisposable.dispose();
        expect(service.rootContainerElement).toBeNull();
    });
});
