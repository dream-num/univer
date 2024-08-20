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

import type { DocumentDataModel, IAccessor, ICommand } from '@univerjs/core';
import { CommandType, CustomRangeType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService, getCustomRangesInterestsWithRange, serializeDocRange, TextSelectionManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { DocHyperLinkModel } from '@univerjs/docs-hyper-link';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export const shouldDisableAddLink = (accessor: IAccessor) => {
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textRanges = textSelectionService.getCurrentTextRanges()?.map(serializeDocRange);
    const renderManagerService = accessor.get(IRenderManagerService);
    const render = renderManagerService.getCurrent();
    const skeleton = render?.with(DocSkeletonManagerService).getSkeleton();
    const editArea = skeleton?.getViewModel().getEditArea();
    if (editArea === DocumentEditArea.FOOTER || editArea === DocumentEditArea.HEADER) {
        return true;
    }
    if (!textRanges || textRanges.length > 1) {
        return true;
    }

    const activeRange = textRanges[0];
    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!doc || !activeRange || activeRange.collapsed) {
        return true;
    }

    const body = doc.getBody();
    const paragraphs = body?.paragraphs;
    if (!paragraphs) {
        return true;
    }

    for (let i = 0, len = paragraphs.length; i < len; i++) {
        const p = paragraphs[i];
        if (activeRange.startOffset <= p.startIndex && activeRange.endOffset > p.startIndex) {
            return true;
        }

        if (p.startIndex > activeRange.endOffset!) {
            break;
        }
    }

    const insertCustomRanges = getCustomRangesInterestsWithRange(activeRange, body.customRanges ?? []);
    // can't insert hyperlink in range contains other custom ranges
    return !insertCustomRanges.every((range) => range.rangeType === CustomRangeType.HYPERLINK);
};

export interface IShowDocHyperLinkEditPopupOperationParams {
    link?: {
        unitId: string;
        linkId: string;
        segmentId?: string;
        segmentPage?: number;
    };
}

export const ShowDocHyperLinkEditPopupOperation: ICommand<IShowDocHyperLinkEditPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'doc.operation.show-hyper-link-edit-popup',
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

export interface IShowDocHyperLinkInfoPopupOperationParams {
    linkId: string;
    segmentId?: string;
    unitId: string;
    segmentPage?: number;
}

export const ToggleDocHyperLinkInfoPopupOperation: ICommand<IShowDocHyperLinkInfoPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'doc.operation.toggle-hyper-link-info-popup',
    handler(accessor, params) {
        const hyperLinkService = accessor.get(DocHyperLinkPopupService);
        if (!params) {
            hyperLinkService.hideInfoPopup();
            return true;
        }

        hyperLinkService.showInfoPopup(params);
        return true;
    },
};

export const ClickDocHyperLinkOperation: ICommand<{ unitId: string; linkId: string }> = {
    type: CommandType.OPERATION,
    id: 'doc.operation.click-hyper-link',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, linkId } = params;
        const docLinkModel = accessor.get(DocHyperLinkModel);
        const link = docLinkModel.getLink(unitId, linkId);
        if (!link) {
            return false;
        }
        window.open(link.payload, '_blank', 'noopener noreferrer');
        return true;
    },
};
