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
    FOCUSING_UNIVER_EDITOR,
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
import { DesktopLayoutService, FOCUSING_UNIVER, ILayoutService } from '../layout.service';

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
        contains: (target: unknown) => containsSelf && target != null && (target as HTMLElement).dataset?.uComp !== 'outside',
    } as unknown as HTMLElement;
}

function dispatchFocusIn(target: HTMLElement): void {
    const event = new Event('focusin');
    Object.defineProperty(event, 'target', {
        configurable: true,
        value: target,
    });
    window.dispatchEvent(event);
}

function createService() {
    const listeners = new Map<string, EventListener[]>();
    vi.stubGlobal('window', {
        addEventListener(type: string, listener: EventListener) {
            listeners.set(type, [...(listeners.get(type) ?? []), listener]);
        },
        removeEventListener(type: string, listener: EventListener) {
            listeners.set(type, (listeners.get(type) ?? []).filter((item) => item !== listener));
        },
        dispatchEvent(event: Event) {
            (listeners.get(event.type) ?? []).forEach((listener) => listener(event));
            return true;
        },
    });
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
        injector,
        service: injector.get(ILayoutService),
        contextService: injector.get(IContextService),
    };
}

describe('DesktopLayoutService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('tracks registered containers and delegates focus to the focused Univer unit type', () => {
        const { service } = createService();
        const root = createElement('app-layout');
        const content = createElement('custom-content');
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

    it('rejects duplicate registrations that would make focus ownership ambiguous', () => {
        const { service } = createService();
        const root = createElement('app-layout');
        const content = createElement('custom-content');
        const container = createElement('dialog');

        service.registerRootContainerElement(root);
        service.registerContentElement(content);
        service.registerContainerElement(container);
        service.registerFocusHandler(UniverInstanceType.UNIVER_SLIDE, () => {});

        expect(() => service.registerRootContainerElement(createElement('other-root'))).toThrow('[DesktopLayoutService]: root container already registered!');
        expect(() => service.registerContentElement(content)).toThrow('[DesktopLayoutService]: content container already registered!');
        expect(() => service.registerContainerElement(container)).toThrow('[LayoutService]: container already registered!');
        expect(() => service.registerFocusHandler(UniverInstanceType.UNIVER_SLIDE, () => {})).toThrow('[DesktopLayoutService]: handler of type 3 bas been registered!');
    });

    it('updates focus context from window focus events and editor active state', async () => {
        const { service, contextService } = createService();
        const focused: string[] = [];
        const root = createElement('app-layout');
        const content = createElement('custom-content');
        const outside = createElement('outside', false);
        const editor = createElement('editor');
        const button = createElement('button');

        service.registerRootContainerElement(root);
        service.registerContentElement(content);
        service.registerFocusHandler(UniverInstanceType.UNIVER_SLIDE, (unitId) => focused.push(unitId));

        Object.defineProperty(globalThis.document, 'activeElement', {
            configurable: true,
            get: () => editor,
        });
        dispatchFocusIn(outside);
        expect(service.isFocused).toBe(false);
        expect(contextService.getContextValue(FOCUSING_UNIVER)).toBe(false);
        expect(contextService.getContextValue(FOCUSING_UNIVER_EDITOR)).toBe(true);

        Object.defineProperty(globalThis.document, 'activeElement', {
            configurable: true,
            get: () => content,
        });
        dispatchFocusIn(content);
        expect(service.isFocused).toBe(true);
        expect(contextService.getContextValue(FOCUSING_UNIVER)).toBe(true);
        expect(contextService.getContextValue(FOCUSING_UNIVER_EDITOR)).toBe(false);

        dispatchFocusIn(button);
        await Promise.resolve();
        expect(focused).toEqual(['slide-1']);
    });

    it('does not give focus back to the host unit when an embed-owned render canvas receives focus', async () => {
        const { service } = createService();
        const focused: string[] = [];
        const embedCanvas = {
            dataset: { uComp: 'render-canvas' },
            closest: vi.fn((selector: string) => selector === '[data-embed-interaction-boundary-owner]' ? {} : null),
        } as unknown as HTMLElement;
        const root = {
            dataset: { uComp: 'app-layout' },
            contains: vi.fn((target: unknown) => target === embedCanvas),
        } as unknown as HTMLElement;

        service.registerRootContainerElement(root);
        service.registerFocusHandler(UniverInstanceType.UNIVER_SLIDE, (unitId) => focused.push(unitId));

        dispatchFocusIn(embedCanvas);
        await Promise.resolve();

        expect(focused).toEqual([]);
    });
});
