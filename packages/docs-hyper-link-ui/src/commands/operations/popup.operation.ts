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

import type { DocumentDataModel, IAccessor, ICommand, IDocumentBody } from '@univerjs/core';
import { CommandType, CustomRangeType, isSafeUrl, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DOC_SELECTION_OPTION_PRESERVE_CARET, DocSelectionManagerService } from '@univerjs/docs';
import { DocBackScrollRenderController } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export const shouldDisableAddLink = (accessor: IAccessor) => {
    const textSelectionService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textRanges = textSelectionService.getTextRanges();
    if (!textRanges?.length) {
        return true;
    }

    const activeRange = textRanges[0];
    const doc = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
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
        const unitId = linkInfo?.unitId || univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)?.getUnitId();

        if (!unitId) {
            return false;
        }
        hyperLinkService.showEditPopup(unitId, linkInfo ?? null);
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
    fromHover?: boolean;
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

        if (params.fromHover) {
            hyperLinkService.showInfoPopupFromHover(params);
        } else {
            hyperLinkService.showInfoPopup(params);
        }
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
        const sourceBody = doc?.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        const link = sourceBody?.customRanges?.find((range) => range.rangeId === linkId && range.rangeType === CustomRangeType.HYPERLINK)?.properties;

        if (link?.bookmarkId || link?.headingId) {
            const targetBody = doc?.getBody();
            const targetOffset = findInternalLinkTarget(targetBody, link.bookmarkId, link.headingId);
            if (targetOffset == null) {
                return false;
            }

            const range = { startOffset: targetOffset, endOffset: targetOffset, collapsed: true };
            const selectionManager = accessor.get(DocSelectionManagerService);
            const selectTarget = (): void => selectionManager.replaceDocRanges(
                [range],
                { unitId, subUnitId: unitId },
                false,
                { [DOC_SELECTION_OPTION_PRESERVE_CARET]: true }
            );
            const render = accessor.get(IRenderManagerService).getRenderUnitById(unitId);
            const renderInjector = render?.getInjector?.();
            const backScrollController = renderInjector?.has(DocBackScrollRenderController)
                ? render?.with(DocBackScrollRenderController)
                : null;

            if (backScrollController) {
                backScrollController.scrollToRange(range, selectTarget);
            } else {
                selectTarget();
            }
            return true;
        }

        if (!link?.url || !isSafeUrl(link.url)) {
            return false;
        }
        window.open(link.url, '_blank', 'noopener noreferrer');
        return true;
    },
};

function findInternalLinkTarget(body: IDocumentBody | undefined, bookmarkId?: string, headingId?: string): number | undefined {
    if (!body) {
        return;
    }

    if (bookmarkId) {
        const bookmark = body.customRanges?.find((range) =>
            range.rangeType === CustomRangeType.BOOKMARK &&
            (range.rangeId === bookmarkId || range.properties?.bookmarkId === bookmarkId)
        );
        if (bookmark) {
            return bookmark.startIndex;
        }
    }

    if (headingId) {
        const paragraphIndex = body.paragraphs?.findIndex((paragraph) => paragraph.paragraphStyle?.headingId === headingId) ?? -1;
        if (paragraphIndex >= 0) {
            return paragraphIndex === 0 ? 0 : body.paragraphs![paragraphIndex - 1].startIndex + 1;
        }
    }
}
