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
import { describe, expect, it } from 'vitest';
import { EmbedModelService } from '../embed-model.service';

describe('EmbedModelService child unit uniqueness', () => {
    it('rejects duplicate active child units in one host resource', () => {
        const model = new EmbedModelService();

        model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-1', hostAnchorId: 'anchor-1' }));

        expect(() => {
            model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }));
        }).toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
    });

    it('rejects duplicate active child units across host resources', () => {
        const model = new EmbedModelService();

        model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-1', hostAnchorId: 'anchor-1' }));

        expect(() => {
            model.addDescriptor('host-2', createDescriptor({
                embedId: 'embed-2',
                hostUnitId: 'host-2',
                hostAnchorId: 'anchor-2',
            }));
        }).toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
    });

    it('allows a soft-deleted descriptor to keep the same child unit reference', () => {
        const model = new EmbedModelService();

        model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-1', hostAnchorId: 'anchor-1' }));
        model.softDeleteDescriptor('host-1', 'embed-1');
        model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }));

        expect(model.getActiveDescriptorsByChildUnit('child-sheet')).toHaveLength(1);
        expect(model.getDescriptor('host-1', 'embed-1')?.lifecycle).toBe('soft-deleted');
        expect(model.getDescriptor('host-1', 'embed-2')?.lifecycle).toBe('active');
    });

    it('rejects restoring a soft-deleted descriptor when another active descriptor owns the child unit', () => {
        const model = new EmbedModelService();

        model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-1', hostAnchorId: 'anchor-1' }));
        model.softDeleteDescriptor('host-1', 'embed-1');
        model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }));

        expect(() => model.restoreDescriptor('host-1', 'embed-1')).toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
    });

    it('drops runtime child unit state when loading a persisted resource', () => {
        const model = new EmbedModelService();

        model.loadUnit('host-1', {
            version: 1,
            embeds: {
                'embed-1': createDescriptor({ embedId: 'embed-1', hostAnchorId: 'anchor-1' }),
                'embed-2': createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }),
            },
        });

        expect(model.getDescriptors('host-1').map((descriptor) => descriptor.childUnitId)).toEqual([undefined, undefined]);
    });
});

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    const childUnitId = overrides.childUnitId ?? 'child-sheet';
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: {
                file: { kind: 'self' },
                unit: {
                    selector: childUnitId,
                    type: 'sheet',
                },
            },
        },
        childUnitId,
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        mode: overrides.mode ?? 'interactive',
        sourceMeta: overrides.sourceMeta ?? {
            floating: {
                enabled: true,
                layout: 'scroll-contained',
            },
            tab: false,
        },
        lifecycle: overrides.lifecycle ?? 'active',
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}
