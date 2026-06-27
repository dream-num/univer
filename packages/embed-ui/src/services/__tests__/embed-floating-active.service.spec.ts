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

import { describe, expect, it } from 'vitest';
import { EmbedFloatingActiveService } from '../embed-floating-active.service';

describe('EmbedFloatingActiveService', () => {
    it('starts a newly activated floating block in stage1', () => {
        const service = new EmbedFloatingActiveService();

        service.activate({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
        });

        expect(service.getStage('embed-1')).toBe('stage1');
        expect(service.getStage('embed-2')).toBe('inactive');
    });

    it('promotes only the active floating block from stage1 to stage2', () => {
        const service = new EmbedFloatingActiveService();

        service.activate({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
        });
        service.promote('embed-1');
        service.promote('embed-2');

        expect(service.getStage('embed-1')).toBe('stage2');
        expect(service.getStage('embed-2')).toBe('inactive');
    });

    it('resets the previous block when another floating block becomes active', () => {
        const service = new EmbedFloatingActiveService();

        service.activate({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
        }, 'stage2');
        service.activate({
            hostUnitId: 'host-1',
            embedId: 'embed-2',
            childUnitId: 'child-2',
        });

        expect(service.getStage('embed-1')).toBe('inactive');
        expect(service.getStage('embed-2')).toBe('stage1');
    });

    it('preserves the stage when re-activating the same block without an explicit stage', () => {
        const service = new EmbedFloatingActiveService();
        const activation = {
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
        };

        service.activate(activation, 'stage2');
        service.activate(activation);

        expect(service.getStage('embed-1')).toBe('stage2');
    });

    it('does not emit when activation or stage does not change', () => {
        const service = new EmbedFloatingActiveService();
        const values: unknown[] = [];
        service.active$.subscribe((value) => values.push(value));
        const activation = {
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
        };

        service.activate(activation, 'stage2');
        service.activate(activation, 'stage2');
        service.setStage('embed-1', 'stage2');

        expect(values).toHaveLength(2);
    });
});
