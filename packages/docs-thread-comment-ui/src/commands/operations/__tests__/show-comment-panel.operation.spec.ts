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

import { describe, expect, it, vi } from 'vitest';

import { DocThreadCommentPanel } from '../../../views/doc-thread-comment-panel';
import { ShowCommentPanelOperation, ToggleCommentPanelOperation } from '../show-comment-panel.operation';

describe('ShowCommentPanelOperation', () => {
    it('should open sidebar and set active comment', () => {
        const setPanelVisible = vi.fn();
        const setActiveComment = vi.fn();
        const panelService = {
            panelVisible: false,
            setPanelVisible,
            setActiveComment,
        };

        const open = vi.fn();
        const sidebarService = {
            options: {},
            open,
        };

        const accessor = {
            get: (token: any) => {
                if (token.name === 'ThreadCommentPanelService') return panelService;
                return sidebarService;
            },
        } as any;

        const ok = ShowCommentPanelOperation.handler(accessor, {
            activeComment: { unitId: 'doc-1', subUnitId: 'default', commentId: 'c1' },
        });

        expect(ok).toBe(true);
        expect(open).toHaveBeenCalledWith(expect.objectContaining({
            children: { label: DocThreadCommentPanel.componentKey },
            width: 320,
        }));
        expect(setPanelVisible).toHaveBeenCalledWith(true);
        expect(setActiveComment).toHaveBeenCalledWith({ unitId: 'doc-1', subUnitId: 'default', commentId: 'c1' });
    });
});

describe('ToggleCommentPanelOperation', () => {
    it('should close sidebar and reset state when already opened', () => {
        const setPanelVisible = vi.fn();
        const setActiveComment = vi.fn();
        const panelService = {
            panelVisible: true,
            setPanelVisible,
            setActiveComment,
        };

        const close = vi.fn();
        const sidebarService = {
            options: { children: { label: DocThreadCommentPanel.componentKey } },
            open: vi.fn(),
            close,
        };

        const accessor = {
            get: (token: any) => {
                if (token.name === 'ThreadCommentPanelService') return panelService;
                return sidebarService;
            },
        } as any;

        const ok = ToggleCommentPanelOperation.handler(accessor);
        expect(ok).toBe(true);
        expect(close).toHaveBeenCalledTimes(1);
        expect(setPanelVisible).toHaveBeenCalledWith(false);
        expect(setActiveComment).toHaveBeenCalledWith(null);
    });
});
