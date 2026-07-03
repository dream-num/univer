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

import type { IEmbedDescriptor } from '../../types/embed';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EmbedModelService } from '../embed-model.service';
import { EmbedReferencedUnitMaterializeService } from '../embed-referenced-unit-materialize.service';
import { EmbedUnitLeasePolicyService } from '../embed-unit-lease-policy.service';
import { EmbedUnitLeaseService } from '../embed-unit-lease.service';

describe('EmbedReferencedUnitMaterializeService unit lease policy', () => {
    it('allows shared materialized child units when embed lease policy is not configured', async () => {
        const { materializeService, model } = createMaterializeService();

        await materializeService.materializeDescriptor({ descriptor: createDescriptor({ embedId: 'embed-1' }) });
        await materializeService.materializeDescriptor({ descriptor: createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }) });

        expect(model.getActiveDescriptorsByChildUnit('shared-child')).toHaveLength(2);
    });

    it('rejects shared materialized child units under internal exclusive embed lease policy', async () => {
        const { materializeService, model } = createMaterializeService({ exclusive: true });

        await materializeService.materializeDescriptor({ descriptor: createDescriptor({ embedId: 'embed-1' }) });
        await expect(
            materializeService.materializeDescriptor({ descriptor: createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }) })
        ).rejects.toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
        expect(model.getActiveDescriptorsByChildUnit('shared-child')).toHaveLength(1);
    });
});

function createMaterializeService(options: { exclusive?: boolean } = {}) {
    const unitLeaseService = new EmbedUnitLeaseService();
    const unitLeasePolicyService = new EmbedUnitLeasePolicyService();
    if (options.exclusive) {
        unitLeasePolicyService.enableExclusivePolicy();
    }
    const model = new EmbedModelService(unitLeaseService);
    const manager = {
        ensure: vi.fn(async (ref: unknown) => ({
            ref,
            unitId: 'shared-child',
            unitType: UniverInstanceType.UNIVER_SHEET,
        })),
    };
    const instanceService = {
        getUnitType: vi.fn(() => UniverInstanceType.UNRECOGNIZED),
    };

    return {
        materializeService: new EmbedReferencedUnitMaterializeService(
            model,
            unitLeaseService,
            unitLeasePolicyService,
            manager as never,
            instanceService as never
        ),
        model,
        manager,
        unitLeasePolicyService,
    };
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: '#unit=shared&type=sheet',
        },
        childUnitId: overrides.childUnitId,
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        mode: overrides.mode ?? 'interactive',
        sourceMeta: overrides.sourceMeta ?? {
            floating: {
                enabled: true,
                layout: 'doc-width-scale',
                fullscreen: true,
            },
            tab: false,
        },
        lifecycle: overrides.lifecycle ?? 'active',
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}
