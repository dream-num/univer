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

import type { IMutiPageParagraphBound } from '../doc-event-manager.service';
import { DocumentEditArea } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocParagraphMenuService } from '../doc-paragraph-menu.service';

describe('DocParagraphMenuService', () => {
    it('shows the paragraph menu for empty paragraphs', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: '\r',
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 0,
            startIndex: 0,
        }));

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
    });

    it('keeps hiding the paragraph menu for image-only paragraphs', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: '\b\r',
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 1,
            startIndex: 1,
        }));

        expect(attachPopupToRect).not.toHaveBeenCalled();
    });

    it('anchors paragraph menu to the latest paragraph bound after layout changes', () => {
        const latestFirstLine = { bottom: 30, left: 20, right: 120, top: 10 };
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
            findParagraphBoundByIndex: () => ({
                firstLine: latestFirstLine,
            }),
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        }));

        const [anchor] = attachPopupToRect.mock.calls[0];
        expect(typeof anchor).toBe('function');
        expect(anchor()).toBe(latestFirstLine);
    });
});

function createService(options: {
    attachPopupToRect: ReturnType<typeof vi.fn>;
    dataStream: string;
    findParagraphBoundByIndex?: ReturnType<typeof vi.fn>;
}) {
    return new DocParagraphMenuService(
        {
            unitId: 'doc-1',
            unit: {
                getBody: () => ({
                    dataStream: options.dataStream,
                    tables: [],
                }),
                getDisabled: () => false,
            },
            scene: {
                getViewport: () => ({
                    onScrollAfter$: {
                        subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })),
                    },
                }),
            },
        } as never,
        {
            getActiveTextRange: () => null,
            replaceDocRanges: vi.fn(),
            textSelection$: new Subject(),
        } as never,
        {
            hoverParagraphRealTime$: new BehaviorSubject(null),
            hoverParagraphLeft$: new BehaviorSubject(null),
            clickCustomRanges$: new Subject(),
            findParagraphBoundByIndex: options.findParagraphBoundByIndex ?? vi.fn(() => null),
        } as never,
        {
            attachPopupToRect: options.attachPopupToRect,
        } as never,
        {
            getViewModel: () => ({
                getEditArea: () => DocumentEditArea.BODY,
            }),
        } as never,
        {
            floatMenu: null,
        } as never
    );
}

function createParagraphBound(partial: Pick<IMutiPageParagraphBound, 'paragraphEnd' | 'paragraphStart' | 'startIndex'>): IMutiPageParagraphBound {
    const rect = { bottom: 20, left: 10, right: 100, top: 0 };

    return {
        ...partial,
        firstLine: rect,
        pageIndex: 0,
        rect,
        rects: [rect],
    };
}
