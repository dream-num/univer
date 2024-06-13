/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { ActiveCommentInfo } from '@univerjs/thread-comment-ui';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { DocThreadCommentPanel } from '../../views/doc-thread-comment-panel';

interface IShowCommentPanelOperationParams {
    activeComment: ActiveCommentInfo;
}

export const ShowCommentPanelOperation: ICommand<IShowCommentPanelOperationParams> = {
    id: 'docs.operation.show-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor, params) {
        const panelService = accessor.get(ThreadCommentPanelService);
        const sidebarService = accessor.get(ISidebarService);

        sidebarService.open({
            header: { title: 'comment' },
            children: { label: DocThreadCommentPanel.componentKey },
            width: 312,
            onClose: () => panelService.setPanelVisible(false),
        });
        panelService.setPanelVisible(true);
        if (params) {
            panelService.setActiveComment(params?.activeComment);
        }

        return true;
    },
};

export const AddCommentPanelOperation: ICommand = {
    id: 'docs.operation.add-comment',
    type: CommandType.OPERATION,
    handler(accessor) {
        const panelService = accessor.get(ThreadCommentPanelService);
        const sidebarService = accessor.get(ISidebarService);

        sidebarService.open({
            header: { title: 'comment' },
            children: { label: DocThreadCommentPanel.componentKey },
            width: 312,
            onClose: () => panelService.setPanelVisible(false),
        });
        panelService.setPanelVisible(true);

        return true;
    },
};
