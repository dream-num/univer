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
import { describe, expect, it, vi } from 'vitest';
import { collectDocsTableLikeEmbedChildUnitIds, createDocsCustomBlockSizeRefreshScheduler, shouldRefreshDocsCustomBlockSizeForCommand } from './embed-docs-custom-block-refresh';

describe('docs custom block refresh helpers', () => {
    it('collects only sheet-like custom block child unit ids', () => {
        expect([...collectDocsTableLikeEmbedChildUnitIds({
            base: { data: { childType: UniverInstanceType.UNIVER_BASE, childUnitId: 'base-1' } },
            doc: { data: { childType: UniverInstanceType.UNIVER_DOC, childUnitId: 'doc-1' } },
            sheet: { data: { childType: UniverInstanceType.UNIVER_SHEET, childUnitId: 'sheet-1' } },
            missing: { data: { childType: UniverInstanceType.UNIVER_SHEET } },
        })].sort()).toEqual(['base-1', 'sheet-1']);
    });

    it('can collect runtime child unit ids through a resolver', () => {
        expect([...collectDocsTableLikeEmbedChildUnitIds({
            base: { data: { childType: UniverInstanceType.UNIVER_BASE, embedId: 'base-embed' } },
            sheet: { data: { childType: UniverInstanceType.UNIVER_SHEET, embedId: 'sheet-embed' } },
            slide: { data: { childType: UniverInstanceType.UNIVER_SLIDE, embedId: 'slide-embed' } },
        }, (data) => {
            if (data.embedId === 'base-embed') {
                return 'base-1';
            }
            if (data.embedId === 'sheet-embed') {
                return 'sheet-1';
            }
            return 'slide-1';
        })].sort()).toEqual(['base-1', 'sheet-1']);
    });

    it('refreshes only when a command targets an embedded child unit', () => {
        const childUnitIds = new Set(['sheet-1']);

        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'sheet-1' },
            hostUnitId: 'doc-host',
        })).toBe(true);
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'doc-host' },
            hostUnitId: 'doc-host',
        })).toBe(false);
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'other' },
            hostUnitId: 'doc-host',
        })).toBe(false);
    });

    it('accepts legacy unitID command params when detecting child unit changes', () => {
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds: new Set(['sheet-1']),
            commandParams: { unitID: 'sheet-1' },
            hostUnitId: 'doc-host',
        })).toBe(true);
    });

    it('coalesces repeated refresh requests into one frame', () => {
        const refresh = vi.fn();
        let frameCallback: (() => void) | undefined;
        const scheduler = createDocsCustomBlockSizeRefreshScheduler(refresh, {
            cancelFrame: vi.fn(),
            requestFrame: (callback) => {
                frameCallback = callback;
                return 1;
            },
        });

        scheduler.schedule();
        scheduler.schedule();
        frameCallback?.();

        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('cancels a pending refresh when disposed', () => {
        const refresh = vi.fn();
        const cancelFrame = vi.fn();
        const scheduler = createDocsCustomBlockSizeRefreshScheduler(refresh, {
            cancelFrame,
            requestFrame: () => 7,
        });

        scheduler.schedule();
        scheduler.dispose();

        expect(cancelFrame).toHaveBeenCalledWith(7);
        expect(refresh).not.toHaveBeenCalled();
    });
});
