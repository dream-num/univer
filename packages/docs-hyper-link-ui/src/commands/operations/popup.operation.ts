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

import type { DocumentDataModel, ICommand } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import type { IAccessor } from '@wendellhu/redi';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export const shouldDisableAddLink = (accessor: IAccessor) => {
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const activeRange = textSelectionService.getActiveRange();
    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!doc || !activeRange || activeRange.collapsed) {
        return (true);
        return;
    }

    const paragraphs = doc.getBody()?.paragraphs;
    if (!paragraphs) {
        return (true);
        return;
    }

    for (let i = 0, len = paragraphs.length; i < len; i++) {
        const p = paragraphs[i];
        if ((activeRange.startOffset) <= p.startIndex && activeRange.endOffset > p.startIndex) {
            return (true);
            return;
        }

        if (p.startIndex > activeRange.endOffset) {
            break;
        }
    }

    return (false);
};

export interface IShowDocHyperLinkEditPopupOperationParams {
    link?: {
        unitId: string;
        linkId: string;
        rangeIndex: number;
    };
}

export const ShowDocHyperLinkEditPopupOperation: ICommand<IShowDocHyperLinkEditPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'docs.operation.show-hyper-link-edit-popup',
    handler(accessor, params) {
        const linkInfo = params?.link;
        if (shouldDisableAddLink(accessor) && !linkInfo) {
            return false;
        }
        const hyperLinkService = accessor.get(DocHyperLinkPopupService);
        hyperLinkService.showEditPopup(linkInfo);
        return true;
    },
};
