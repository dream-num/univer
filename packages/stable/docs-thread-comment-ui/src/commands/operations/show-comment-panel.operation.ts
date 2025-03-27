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

import type { DocumentDataModel, ICommand } from '@univerjs/core';
import type { ActiveCommentInfo } from '@univerjs/thread-comment-ui';
import { BuildTextUtils, CommandType, ICommandService, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getDT } from '@univerjs/thread-comment';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';
import { DocThreadCommentService } from '../../services/doc-thread-comment.service';
import { DocThreadCommentPanel } from '../../views/doc-thread-comment-panel';

export interface IShowCommentPanelOperationParams {
    activeComment: ActiveCommentInfo;
}

export const ShowCommentPanelOperation: ICommand<IShowCommentPanelOperationParams> = {
    id: 'docs.operation.show-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor, params) {
        const panelService = accessor.get(ThreadCommentPanelService);
        const sidebarService = accessor.get(ISidebarService);

        if (!panelService.panelVisible || sidebarService.options.children?.label !== DocThreadCommentPanel.componentKey) {
            sidebarService.open({
                header: { title: 'threadCommentUI.panel.title' },
                children: { label: DocThreadCommentPanel.componentKey },
                width: 320,
                onClose: () => panelService.setPanelVisible(false),
            });
            panelService.setPanelVisible(true);
        }

        if (params) {
            panelService.setActiveComment(params?.activeComment);
        }

        return true;
    },
};

export const ToggleCommentPanelOperation: ICommand = {
    id: 'docs.operation.toggle-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        const panelService = accessor.get(ThreadCommentPanelService);
        const sidebarService = accessor.get(ISidebarService);

        if (!panelService.panelVisible || sidebarService.options.children?.label !== DocThreadCommentPanel.componentKey) {
            sidebarService.open({
                header: { title: 'threadCommentUI.panel.title' },
                children: { label: DocThreadCommentPanel.componentKey },
                width: 320,
                onClose: () => panelService.setPanelVisible(false),
            });
            panelService.setPanelVisible(true);
        } else {
            sidebarService.close();
            panelService.setPanelVisible(false);
            panelService.setActiveComment(null);
        }
        return true;
    },
};

export const StartAddCommentOperation: ICommand = {
    id: 'docs.operation.start-add-comment',
    type: CommandType.OPERATION,
    handler(accessor) {
        const panelService = accessor.get(ThreadCommentPanelService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const userManagerService = accessor.get(UserManagerService);
        const docCommentService = accessor.get(DocThreadCommentService);
        const commandService = accessor.get(ICommandService);
        const sidebarService = accessor.get(ISidebarService);
        const textRange = docSelectionManagerService.getActiveTextRange();
        if (!doc || !textRange) {
            return false;
        }

        const docSelectionRenderManager = renderManagerService.getRenderById(doc.getUnitId())?.with(DocSelectionRenderService);
        docSelectionRenderManager?.setReserveRangesStatus(true);
        if (textRange.collapsed) {
            if (panelService.panelVisible) {
                panelService.setPanelVisible(false);
                sidebarService.close();
            } else {
                commandService.executeCommand(ShowCommentPanelOperation.id);
            }
            return true;
        }

        commandService.executeCommand(ShowCommentPanelOperation.id);
        const unitId = doc.getUnitId();
        const dataStream = (doc.getBody()?.dataStream ?? '').slice(textRange.startOffset, textRange.endOffset);
        const text = BuildTextUtils.transform.getPlainText(dataStream);
        const subUnitId = DEFAULT_DOC_SUBUNIT_ID;
        const commentId = '';
        const comment = {
            unitId,
            subUnitId,
            id: commentId,
            ref: text,
            dT: getDT(),
            personId: userManagerService.getCurrentUser().userID,
            text: {
                dataStream: '\r\n',
            },
            startOffset: textRange.startOffset!,
            endOffset: textRange.endOffset!,
            collapsed: true,
            threadId: commentId,
        };

        docSelectionRenderManager?.blur();
        docCommentService.startAdd(comment);
        panelService.setActiveComment({
            unitId,
            subUnitId,
            commentId,
        });

        return true;
    },
};
