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

function createRenderUnit() {
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
});
