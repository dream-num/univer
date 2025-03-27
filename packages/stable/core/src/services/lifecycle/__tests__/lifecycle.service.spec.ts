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

import { afterEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';

import { DesktopLogService, ILogService } from '../../log/log.service';
import { LifecycleStages } from '../lifecycle';
import { LifecycleService } from '../lifecycle.service';

function createLifecycleTestBed() {
    const injector = new Injector();

    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([LifecycleService]);

    return {
        injector,
    };
}

describe('Test LifecycleService', () => {
    let injector: Injector;
    let lifecycleService: LifecycleService;

    afterEach(() => {
        injector.dispose();
    });

    it('Should be able to progress lifecycle stages', () => {
        injector = createLifecycleTestBed().injector;
        lifecycleService = injector.get(LifecycleService);

        const lifecycleStages: LifecycleStages[] = [];
        lifecycleService.lifecycle$.subscribe((stage) => lifecycleStages.push(stage));

        lifecycleService.stage = LifecycleStages.Starting;
        expect(lifecycleStages).toEqual([LifecycleStages.Starting]);
        lifecycleService.stage = LifecycleStages.Ready;
        expect(lifecycleStages).toEqual([LifecycleStages.Starting, LifecycleStages.Ready]);

        // Cannot go backward
        expect(() => {
            lifecycleService.stage = LifecycleStages.Starting;
        }).toThrowError('[LifecycleService]: lifecycle stage cannot go backward!');

        lifecycleService.stage = LifecycleStages.Rendered;
        expect(lifecycleStages).toEqual([LifecycleStages.Starting, LifecycleStages.Ready, LifecycleStages.Rendered]);
        expect(lifecycleService.stage).toEqual(LifecycleStages.Rendered);

        lifecycleService.stage = LifecycleStages.Steady;
        expect(lifecycleStages).toEqual([
            LifecycleStages.Starting,
            LifecycleStages.Ready,
            LifecycleStages.Rendered,
            LifecycleStages.Steady,
        ]);
    });

    it('Should "subscribeWithPrevious" emit all previous stages', () => {
        injector = createLifecycleTestBed().injector;
        lifecycleService = injector.get(LifecycleService);

        const lifecycleStages1: LifecycleStages[] = [];
        lifecycleService.subscribeWithPrevious().subscribe((stage) => lifecycleStages1.push(stage));

        lifecycleService.stage = LifecycleStages.Starting;
        const lifecycleStages2: LifecycleStages[] = [];
        lifecycleService.subscribeWithPrevious().subscribe((stage) => lifecycleStages2.push(stage));
        const startingStage = [LifecycleStages.Starting];
        expect(lifecycleStages1).toEqual(startingStage);
        expect(lifecycleStages2).toEqual(startingStage);

        lifecycleService.stage = LifecycleStages.Ready;
        const lifecycleStages3: LifecycleStages[] = [];
        lifecycleService.subscribeWithPrevious().subscribe((stage) => lifecycleStages3.push(stage));
        const readyStates = [LifecycleStages.Starting, LifecycleStages.Ready];
        expect(lifecycleStages1).toEqual(readyStates);
        expect(lifecycleStages2).toEqual(readyStates);
        expect(lifecycleStages3).toEqual(readyStates);

        lifecycleService.stage = LifecycleStages.Rendered;
        const lifecycleStages4: LifecycleStages[] = [];
        lifecycleService.subscribeWithPrevious().subscribe((stage) => lifecycleStages4.push(stage));
        const renderedStates = [LifecycleStages.Starting, LifecycleStages.Ready, LifecycleStages.Rendered];
        expect(lifecycleStages1).toEqual(renderedStates);
        expect(lifecycleStages2).toEqual(renderedStates);
        expect(lifecycleStages3).toEqual(renderedStates);
        expect(lifecycleStages4).toEqual(renderedStates);

        lifecycleService.stage = LifecycleStages.Steady;
        const lifecycleStages5: LifecycleStages[] = [];
        lifecycleService.subscribeWithPrevious().subscribe((stage) => lifecycleStages5.push(stage));
        const steadyStages = [
            LifecycleStages.Starting,
            LifecycleStages.Ready,
            LifecycleStages.Rendered,
            LifecycleStages.Steady,
        ];
        expect(lifecycleStages1).toEqual(steadyStages);
        expect(lifecycleStages2).toEqual(steadyStages);
        expect(lifecycleStages3).toEqual(steadyStages);
        expect(lifecycleStages4).toEqual(steadyStages);
        expect(lifecycleStages5).toEqual(steadyStages);
    });
});
