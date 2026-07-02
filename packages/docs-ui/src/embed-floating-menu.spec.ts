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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createDocsFloatingMenuContributions, resolveDocsFloatingMenuClassName, resolveDocsFloatingMenuStage } from './EmbedFloatingMenu';

describe('createDocsFloatingMenuContributions', () => {
    it('registers docs floating menus for doc, sheet, and slide hosts', () => {
        const contributions = createDocsFloatingMenuContributions();

        expect(contributions.map(({ hostType, entry, childType }) => ({ hostType, entry, childType }))).toEqual([
            {
                hostType: UniverInstanceType.UNIVER_DOC,
                entry: 'docs-custom-block',
                childType: UniverInstanceType.UNIVER_DOC,
            },
            {
                hostType: UniverInstanceType.UNIVER_SHEET,
                entry: 'sheets-floating-object',
                childType: UniverInstanceType.UNIVER_DOC,
            },
            {
                hostType: UniverInstanceType.UNIVER_SLIDE,
                entry: 'slides-floating-object',
                childType: UniverInstanceType.UNIVER_DOC,
            },
        ]);
    });

    it('resolves menu visibility from fullscreen, active state, and slide host render activity', () => {
        expect(resolveDocsFloatingMenuStage({
            active: null,
            embedId: 'embed-1',
            fullscreen: true,
            renderScopeActive: false,
            usesDomFloatingStage: true,
        })).toBe('stage2');
        expect(resolveDocsFloatingMenuStage({
            active: {
                hostUnitId: 'host-1',
                embedId: 'embed-1',
                childUnitId: 'child-1',
                stage: 'stage2',
            },
            embedId: 'embed-1',
            fullscreen: false,
            renderScopeActive: false,
            usesDomFloatingStage: true,
        })).toBe('stage2');
        expect(resolveDocsFloatingMenuStage({
            active: {
                hostUnitId: 'host-1',
                embedId: 'embed-1',
                childUnitId: 'child-1',
                stage: 'stage1',
            },
            embedId: 'embed-1',
            fullscreen: false,
            renderScopeActive: false,
            usesDomFloatingStage: true,
        })).toBe('inactive');
        expect(resolveDocsFloatingMenuStage({
            active: null,
            embedId: 'embed-1',
            fullscreen: false,
            renderScopeActive: true,
            usesDomFloatingStage: false,
        })).toBe('stage2');
        expect(resolveDocsFloatingMenuStage({
            active: {
                hostUnitId: 'host-1',
                embedId: 'other',
                childUnitId: 'child-1',
                stage: 'stage2',
            },
            embedId: 'embed-1',
            fullscreen: false,
            renderScopeActive: false,
            usesDomFloatingStage: true,
        })).toBe('inactive');
    });
});

describe('resolveDocsFloatingMenuClassName', () => {
    it('centers the floating menu with Tailwind classes and keeps fullscreen in normal flow', () => {
        const floatingClassName = resolveDocsFloatingMenuClassName({
            entry: 'sheets-floating-object',
            fullscreen: false,
            stage: 'stage2',
        });
        expect(floatingClassName).toContain('univer-left-1/2');
        expect(floatingClassName).toContain('-univer-translate-x-1/2');
        expect(floatingClassName).toContain('-univer-top-9');

        const fullscreenClassName = resolveDocsFloatingMenuClassName({
            entry: 'sheets-floating-object',
            fullscreen: true,
            stage: 'stage2',
        });
        expect(fullscreenClassName).toContain('univer-static');
        expect(fullscreenClassName).toContain('univer-mx-auto');
        expect(fullscreenClassName).not.toContain('-univer-translate-x-1/2');
    });

    it('uses the docs custom block inset variable and hides inactive menus', () => {
        const className = resolveDocsFloatingMenuClassName({
            entry: 'docs-custom-block',
            fullscreen: false,
            stage: 'inactive',
        });

        expect(className).toContain('univer-hidden');
        expect(className).toContain('univer-top-[calc(var(--univer-embed-docs-block-floating-menu-inset-top,52px)*-1)]');
    });
});
