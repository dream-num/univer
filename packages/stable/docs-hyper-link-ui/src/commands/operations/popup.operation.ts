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

import type { DocumentDataModel, IAccessor, ICommand } from '@univerjs/core';
import { CommandType, CustomRangeType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export const shouldDisableAddLink = (accessor: IAccessor) => {
    const textSelectionService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textRanges = textSelectionService.getTextRanges();
    if (!textRanges?.length) {
        return true;
    }

    const activeRange = textRanges[0];
    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!doc || !activeRange || activeRange.collapsed) {
        return true;
    }

    return false;
};

export interface IShowDocHyperLinkEditPopupOperationParams {
    link?: {
        unitId: string;
        linkId: string;
        segmentId?: string;
        segmentPage?: number;
        startIndex: number;
        endIndex: number;
    };
}

export const ShowDocHyperLinkEditPopupOperation: ICommand<IShowDocHyperLinkEditPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'doc.operation.show-hyper-link-edit-popup',
    handler(accessor, params) {
        const linkInfo = params?.link;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        if (shouldDisableAddLink(accessor) && !linkInfo) {
            return false;
        }
        const hyperLinkService = accessor.get(DocHyperLinkPopupService);
        const unitId = linkInfo?.unitId || univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)?.getUnitId();

        if (!unitId) {
            return false;
        }
        hyperLinkService.showEditPopup(unitId, linkInfo);
        return true;
    },
};

export interface IShowDocHyperLinkInfoPopupOperationParams {
    linkId: string;
    segmentId?: string;
    unitId: string;
    segmentPage?: number;
    startIndex: number;
    endIndex: number;
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

export const ClickDocHyperLinkOperation: ICommand<{ unitId: string; linkId: string; segmentId?: string }> = {
    type: CommandType.OPERATION,
    id: 'doc.operation.click-hyper-link',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, linkId, segmentId } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const body = doc?.getSelfOrHeaderFooterModel(segmentId).getBody();
        const link = body?.customRanges?.find((range) => range.rangeId === linkId && range.rangeType === CustomRangeType.HYPERLINK)?.properties?.url;

        if (link) {
            window.open(link, '_blank', 'noopener noreferrer');
        }
        return true;
    },
};
