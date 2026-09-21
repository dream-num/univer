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
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { FormatPainterSessionService } from '../format-painter-session.service';

const injectors: Injector[] = [];
function setup() {
    const injector = new Injector([[FormatPainterSessionService]]);
    injectors.push(injector);
    return injector.get(FormatPainterSessionService);
}
afterEach(() => {
    injectors.splice(0).forEach((injector) => injector.dispose());
});

describe('format painter sessions', () => {
    it('upgrades single-click to continuous without sampling again, and retains its snapshot', async () => {
        const session = setup();
        let style = 'red';
        let samples = 0;
        const applied: string[] = [];
        session.register({
            id: 'shape',
            priority: 10,
            changes$: new Subject(),
            isActive: () => true,
            canStart: () => true,
            capture: () => {
                samples++;
                const snapshot = style;
                return { unitId: 'unit', apply: () => {
                    applied.push(snapshot);
                    return true;
                } };
            },
        });
        expect(session.activate()).toBe(true);
        style = 'blue';
        session.activate(true);
        await session.apply('shape', { unitId: 'unit' });
        await session.apply('shape', { unitId: 'unit' });
        expect(applied).toEqual(['red', 'red']);
        expect(samples).toBe(1);
        expect(session.mode).toBe('continuous');
        session.activate();
        expect(session.mode).toBe('off');
    });

    it('exits once only after successful application and rejects other domains or units', async () => {
        const session = setup();
        let success = false;
        session.register({
            id: 'text',
            priority: 1,
            changes$: new Subject(),
            isActive: () => true,
            canStart: () => true,
            capture: () => ({ unitId: 'unit', apply: () => success }),
        });
        session.activate();
        expect(await session.apply('cell', { unitId: 'unit' })).toBe(false);
        expect(await session.apply('text', { unitId: 'other' })).toBe(false);
        expect(await session.apply('text', { unitId: 'unit' })).toBe(false);
        expect(session.mode).toBe('once');
        success = true;
        expect(await session.apply('text', { unitId: 'unit' })).toBe(true);
        expect(session.mode).toBe('off');
    });

    it('does not fall through to a stale cell selection when a shape selection cannot be sampled', () => {
        const session = setup();
        const changes$ = new Subject();
        session.register({ id: 'cell', priority: 0, changes$, isActive: () => true, canStart: () => true, capture: () => ({ unitId: 'u', apply: () => true }) });
        session.register({ id: 'shape', priority: 100, changes$, isActive: () => true, canStart: () => false, capture: () => null });
        expect(session.canStart()).toBe(false);
        expect(session.activate()).toBe(false);
    });

    it('clears the active editing domain, cancels the brush and never falls through to stale cells', async () => {
        const session = setup();
        let cellsCleared = 0;
        let shapesCleared = 0;
        let editable = false;
        const changes$ = new Subject();
        session.register({ id: 'cell', priority: 0, changes$, isActive: () => true, canStart: () => true, capture: () => null, clear: () => {
            cellsCleared++;
            return true;
        } });
        session.register({
            id: 'shape',
            priority: 100,
            changes$,
            isActive: () => true,
            canStart: () => editable,
            capture: () => ({ unitId: 'u', apply: () => true }),
            clear: () => {
                shapesCleared++;
                return true;
            },
        });
        expect(session.canClear()).toBe(false);
        expect(await session.clearFormatting()).toBe(false);
        editable = true;
        session.activate(true);
        expect(session.canClear()).toBe(true);
        expect(await session.clearFormatting()).toBe(true);
        expect(session.mode).toBe('off');
        expect(shapesCleared).toBe(1);
        expect(cellsCleared).toBe(0);
    });

    it('does not let an old asynchronous application cancel a new session', async () => {
        const session = setup();
        let finish!: (success: boolean) => void;
        session.register({
            id: 'shape',
            priority: 1,
            changes$: new Subject(),
            isActive: () => true,
            canStart: () => true,
            capture: () => ({ unitId: 'unit', apply: () => new Promise<boolean>((resolve) => { finish = resolve; }) }),
        });
        session.activate();
        const pending = session.apply('shape', { unitId: 'unit' });
        expect(await session.apply('shape', { unitId: 'unit' })).toBe(false);
        session.cancel();
        session.activate();
        finish(true);
        await pending;
        expect(session.mode).toBe('once');
    });
});
