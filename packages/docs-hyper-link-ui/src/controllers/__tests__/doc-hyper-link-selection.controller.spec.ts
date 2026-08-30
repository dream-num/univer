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

import type { IDisposable } from '@univerjs/core';
import type { ISetTextSelectionsOperationParams } from '@univerjs/docs';
import { CustomRangeType } from '@univerjs/core';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import { describe, expect, it, vi } from 'vitest';
import { DocHyperLinkSelectionController } from '../doc-hyper-link-selection.controller';

describe('DocHyperLinkSelectionController', () => {
    it('shows hyperlink details when the caret is at the first character', () => {
        let commandListener: ((commandInfo: { id: string; params: unknown }) => void) | undefined;
        const commandService = {
            onCommandExecuted: vi.fn((listener) => {
                commandListener = listener;
                return { dispose: vi.fn() } as IDisposable;
            }),
        };
        const doc = {
            getSelfOrHeaderFooterModel: vi.fn(() => ({
                getBody: () => ({
                    customRanges: [{
                        rangeId: 'link-1',
                        rangeType: CustomRangeType.HYPERLINK,
                        startIndex: 5,
                        endIndex: 10,
                    }],
                }),
            })),
        };
        const univerInstanceService = {
            getUnit: vi.fn(() => doc),
        };
        const popupService = {
            showInfoPopup: vi.fn(),
            hideInfoPopup: vi.fn(),
            hideEditPopup: vi.fn(),
        };
        const controller = new DocHyperLinkSelectionController(
            commandService as never,
            univerInstanceService as never,
            popupService as never
        );
        const params: ISetTextSelectionsOperationParams = {
            unitId: 'doc-unit',
            subUnitId: 'doc-unit',
            segmentId: '',
            isEditing: false,
            style: {
                fill: 'rgba(0, 0, 0, 0)',
                stroke: 'rgba(0, 0, 0, 0)',
                strokeActive: 'rgba(0, 0, 0, 0)',
                strokeWidth: 0,
            },
            ranges: [{ startOffset: 5, endOffset: 5, collapsed: true }],
        };

        commandListener?.({ id: SetTextSelectionsOperation.id, params });

        expect(popupService.showInfoPopup).toHaveBeenCalledWith({
            unitId: 'doc-unit',
            linkId: 'link-1',
            segmentId: '',
            segmentPage: undefined,
            startIndex: 5,
            endIndex: 10,
        });
        expect(popupService.hideInfoPopup).not.toHaveBeenCalled();

        controller.dispose();
    });
});
