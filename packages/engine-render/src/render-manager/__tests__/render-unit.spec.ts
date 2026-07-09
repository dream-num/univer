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

import type { IRenderContext, IRenderModule } from '../render-unit';
import { Disposable, Injector, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { RenderUnit } from '../render-unit';

class RenderModuleA extends Disposable implements IRenderModule {
    static calls = 0;

    constructor(readonly context: IRenderContext) {
        super();
        RenderModuleA.calls += 1;
    }
}

class RenderModuleToken extends Disposable implements IRenderModule {}

class RenderModuleB extends Disposable implements IRenderModule {
    static calls = 0;

    constructor(readonly context: IRenderContext) {
        super();
        RenderModuleB.calls += 1;
    }
}

class RenderModuleC extends Disposable implements IRenderModule {
    static calls = 0;

    constructor(readonly context: IRenderContext) {
        super();
        RenderModuleC.calls += 1;
    }
}

class EarlyResolvingRenderModule extends Disposable implements IRenderModule {
    static resolve?: () => void;

    constructor(readonly context: IRenderContext) {
        super();
        EarlyResolvingRenderModule.resolve?.();
    }
}

class ReentrantRenderModule extends Disposable implements IRenderModule {
    static calls = 0;
    static renderUnit: RenderUnit | undefined;
    static token: unknown;
    static resolvedDuringConstruction: unknown;

    constructor(readonly context: IRenderContext) {
        super();
        ReentrantRenderModule.calls += 1;
        ReentrantRenderModule.resolvedDuringConstruction = ReentrantRenderModule.renderUnit?.with(ReentrantRenderModule.token as never);
    }
}

function createRenderUnit(createUnitOptions?: any) {
    const parentInjector = new Injector();
    const unit = {
        getUnitId: () => 'unit-1',
        type: UniverInstanceType.UNIVER_SHEET,
    } as any;

    const renderUnit = parentInjector.createInstance(RenderUnit, {
        engine: {} as any,
        scene: {} as any,
        isMainScene: true,
        unit,
        createUnitOptions,
    });

    return renderUnit;
}

describe('render unit', () => {
    it('initializes context and toggles activation stream', () => {
        const renderUnit = createRenderUnit();
        const states: boolean[] = [];
        const sub = renderUnit.activated$.subscribe((v) => states.push(v));

        renderUnit.deactivate();
        renderUnit.activate();

        expect(renderUnit.unitId).toBe('unit-1');
        expect(renderUnit.type).toBe(UniverInstanceType.UNIVER_SHEET);
        expect(states).toEqual([true, false, true]);

        sub.unsubscribe();
        renderUnit.dispose();
    });

    it('keeps render dependencies accessible while dispose deactivates subscribers', () => {
        const renderUnit = createRenderUnit();
        renderUnit.addRenderDependencies([RenderModuleA as any] as any);
        const resolvedDuringDeactivate: RenderModuleA[] = [];
        const sub = renderUnit.activated$.subscribe((active) => {
            if (!active) {
                resolvedDuringDeactivate.push(renderUnit.with(RenderModuleA));
            }
        });

        expect(() => renderUnit.dispose()).not.toThrow();
        expect(resolvedDuringDeactivate).toHaveLength(1);

        sub.unsubscribe();
    });

    it('registers render dependencies by class and useClass mapping', () => {
        RenderModuleA.calls = 0;
        RenderModuleB.calls = 0;
        const renderUnit = createRenderUnit();

        renderUnit.addRenderDependencies([RenderModuleA as any] as any);
        expect(RenderModuleA.calls).toBe(1);
        expect(renderUnit.with(RenderModuleA)).toBeInstanceOf(RenderModuleA);

        renderUnit.addRenderDependencies([
            [RenderModuleToken, { useClass: RenderModuleB }],
        ] as any);
        expect(RenderModuleB.calls).toBe(1);
        expect(renderUnit.with(RenderModuleToken)).toBeInstanceOf(RenderModuleB);

        expect(() => {
            renderUnit.addRenderDependencies([
                [RenderModuleToken, { useValue: new RenderModuleB({} as any) }],
            ] as any);
        }).toThrow('[RenderUnit]: render dependency could only be an class!');

        renderUnit.components.set('main', {} as any);
        renderUnit.dispose();
        expect(renderUnit.components.size).toBe(0);
    });

    it('deduplicates identifier decorators before adding render dependencies', () => {
        RenderModuleB.calls = 0;
        const renderUnit = createRenderUnit();
        const tokenA = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' });
        const tokenB = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' });

        renderUnit.addRenderDependencies([
            [tokenA, { useClass: RenderModuleB }],
            [tokenB, { useClass: RenderModuleB }],
        ] as any);

        expect(RenderModuleB.calls).toBe(1);
        expect(renderUnit.with(tokenA as never)).toBeInstanceOf(RenderModuleB);

        renderUnit.dispose();
    });

    it('does not initialize a render dependency twice when another module resolves it early', () => {
        RenderModuleC.calls = 0;
        const renderUnit = createRenderUnit();
        const tokenA = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' });
        const tokenB = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' });
        EarlyResolvingRenderModule.resolve = () => {
            expect(renderUnit.with(tokenA as never)).toBeInstanceOf(RenderModuleC);
        };

        expect(() => renderUnit.addRenderDependencies([
            EarlyResolvingRenderModule,
            [tokenB, { useClass: RenderModuleC }],
            [tokenA, { useClass: RenderModuleC }],
        ] as any)).not.toThrow();

        expect(RenderModuleC.calls).toBe(1);
        expect(renderUnit.with(tokenA as never)).toBeInstanceOf(RenderModuleC);

        EarlyResolvingRenderModule.resolve = undefined;
        renderUnit.dispose();
    });

    it('does not re-enter the same render dependency while it is being constructed', () => {
        ReentrantRenderModule.calls = 0;
        ReentrantRenderModule.resolvedDuringConstruction = undefined;
        const renderUnit = createRenderUnit();
        const token = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' });
        ReentrantRenderModule.renderUnit = renderUnit;
        ReentrantRenderModule.token = token;

        expect(() => renderUnit.addRenderDependencies([
            [token, { useClass: ReentrantRenderModule }],
        ] as any)).not.toThrow();

        expect(ReentrantRenderModule.calls).toBe(1);
        expect(ReentrantRenderModule.resolvedDuringConstruction).toBeUndefined();
        expect(renderUnit.with(token as never)).toBeInstanceOf(ReentrantRenderModule);

        ReentrantRenderModule.renderUnit = undefined;
        ReentrantRenderModule.token = undefined;
        renderUnit.dispose();
    });

    it('resolves render dependencies from the render unit injector itself', () => {
        RenderModuleB.calls = 0;
        const parentInjector = new Injector();
        const token = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' }) as any;
        parentInjector.add([token, { useValue: 'parent-a' }]);
        parentInjector.add([token, { useValue: 'parent-b' }]);
        const unit = {
            getUnitId: () => 'unit-1',
            type: UniverInstanceType.UNIVER_SHEET,
        } as any;
        const renderUnit = parentInjector.createInstance(RenderUnit, {
            engine: {} as any,
            scene: {} as any,
            isMainScene: true,
            unit,
        });

        renderUnit.addRenderDependencies([
            [token, { useClass: RenderModuleB }],
        ] as any);

        expect(RenderModuleB.calls).toBe(1);
        expect(renderUnit.with(token)).toBeInstanceOf(RenderModuleB);

        renderUnit.dispose();
    });

    it('derives render dependencies from explicit render parent injector', () => {
        const rootInjector = new Injector();
        const renderParentInjector = rootInjector.createChild();
        const token = Object.assign(() => undefined, { decoratorName: 'univer.test.render-parent-token' }) as any;
        renderParentInjector.add([token, { useValue: 'render-parent-value' }]);
        const unit = {
            getUnitId: () => 'unit-1',
            type: UniverInstanceType.UNIVER_SHEET,
        } as any;
        const renderUnit = rootInjector.createInstance(RenderUnit, {
            engine: {} as any,
            scene: {} as any,
            isMainScene: true,
            unit,
            createUnitOptions: { renderParentInjector },
        });

        expect(renderUnit.getInjector().get(token)).toBe('render-parent-value');

        renderUnit.dispose();
    });

    it('exposes mutable render context state for scene lifecycle coordination', () => {
        const renderUnit = createRenderUnit({ makeCurrent: false });
        const states: boolean[] = [];
        const sub = renderUnit.activated$.subscribe((v) => states.push(v));
        const nextEngine = { name: 'engine-2' } as any;
        const nextScene = { name: 'scene-2' } as any;
        const component = { key: 'main-component' } as any;

        expect(states).toEqual([false]);
        expect(renderUnit.isMainScene).toBe(true);

        renderUnit.activate();
        renderUnit.isMainScene = false;
        renderUnit.engine = nextEngine;
        renderUnit.scene = nextScene;
        renderUnit.mainComponent = component;
        renderUnit.components.set('selection', component);

        const context = renderUnit.getRenderContext();
        expect(states).toEqual([false, true]);
        expect(renderUnit.isMainScene).toBe(false);
        expect(context.isMainScene).toBe(false);
        expect(renderUnit.engine).toBe(nextEngine);
        expect(context.engine).toBe(nextEngine);
        expect(renderUnit.scene).toBe(nextScene);
        expect(context.scene).toBe(nextScene);
        expect(renderUnit.mainComponent).toBe(component);
        expect(context.components.get('selection')).toBe(component);
        expect(context.unitId).toBe('unit-1');

        sub.unsubscribe();
        renderUnit.dispose();
        expect(renderUnit.isDisposed()).toBe(true);
    });
});
