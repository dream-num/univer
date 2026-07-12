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
import type { ICreateHeaderFooterCommandParams, IHeaderFooterProps } from '@univerjs/docs';
import {
    BooleanNumber,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    resolveSectionHeaderFooterReferences,
    UniverInstanceType,
} from '@univerjs/core';
import { CreateHeaderFooterCommand, DocSelectionManagerService, DocSkeletonManagerService, getTopLevelSectionBreaks, HeaderFooterType } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { findFirstCursorOffset } from '../../basics/selection';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { SidebarDocHeaderFooterPanelOperation } from '../operations/doc-header-footer-panel.operation';

export interface ICoreHeaderFooterParams {
    unitId: string;
    createType?: HeaderFooterType;
    segmentId?: string;
    sectionId?: string;
    headerFooterProps?: IHeaderFooterProps;
}

export const CoreHeaderFooterCommandId = 'doc.command.core-header-footer';

/**
 * The command to update header and footer or create them.
 */
export const CoreHeaderFooterCommand: ICommand<ICoreHeaderFooterParams> = {
    id: CoreHeaderFooterCommandId,
    type: CommandType.COMMAND,

    handler: async (accessor, params: ICoreHeaderFooterParams) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const { unitId, segmentId, createType, headerFooterProps, sectionId: requestedSectionId } = params;
        const docSkeletonManagerService = renderManagerService.getRenderUnitById(unitId)?.with(DocSkeletonManagerService);
        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const docViewModel = docSkeletonManagerService?.getViewModel();

        if (docDataModel == null || docViewModel == null) {
            return false;
        }

        const editArea = docViewModel.getEditArea();

        const snapshot = docDataModel.getSnapshot();
        const sectionId = requestedSectionId;
        const sections = snapshot.body ? getTopLevelSectionBreaks(snapshot.body) : [];
        const sectionIndex = sectionId == null ? -1 : sections.findIndex((section) => section.sectionId === sectionId);
        const section = sectionIndex < 0 ? undefined : sections[sectionIndex];
        const headerFooterConfig = sectionId == null
            ? snapshot.documentStyle
            : {
                ...snapshot.documentStyle,
                ...section,
                ...resolveSectionHeaderFooterReferences(snapshot.documentStyle, sections, sectionIndex),
            };

        let resolvedCreateType = createType;

        if (headerFooterProps != null) {
            Object.keys(headerFooterProps).forEach((key) => {
                const value = headerFooterProps[key as keyof IHeaderFooterProps];

                // need create first page header/footer if useFirstPageHeaderFooter is true and firstPageHeaderId is not set.
                if (resolvedCreateType == null && key === 'useFirstPageHeaderFooter' && value === BooleanNumber.TRUE && !headerFooterConfig.firstPageHeaderId) {
                    resolvedCreateType = editArea === DocumentEditArea.HEADER ? HeaderFooterType.FIRST_PAGE_HEADER : HeaderFooterType.FIRST_PAGE_FOOTER;
                } else if (resolvedCreateType == null && key === 'evenAndOddHeaders' && value === BooleanNumber.TRUE && !headerFooterConfig.evenPageHeaderId) {
                    resolvedCreateType = editArea === DocumentEditArea.HEADER ? HeaderFooterType.EVEN_PAGE_HEADER : HeaderFooterType.EVEN_PAGE_FOOTER;
                }
            });
        }

        const result = commandService.syncExecuteCommand<ICreateHeaderFooterCommandParams>(CreateHeaderFooterCommand.id, {
            unitId,
            segmentId,
            createType: resolvedCreateType,
            headerFooterProps,
            createMode: sectionId == null ? 'pair' : 'single',
            sectionId,
        });

        return result;
    },
};

interface IOpenHeaderFooterPanelParams { }

export const OpenHeaderFooterPanelCommand: ICommand<IOpenHeaderFooterPanelParams> = {
    id: 'doc.command.open-header-footer-panel',
    type: CommandType.COMMAND,

    handler: async (accessor, _params: IOpenHeaderFooterPanelParams) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(SidebarDocHeaderFooterPanelOperation.id, { value: 'open' });
    },
};

interface ICloseHeaderFooterParams {
    unitId?: string;
}

export const CloseHeaderFooterCommand: ICommand<ICloseHeaderFooterParams> = {
    id: 'doc.command.close-header-footer',

    type: CommandType.COMMAND,

    handler: async (accessor, params: ICloseHeaderFooterParams) => {
        const commandService = accessor.get(ICommandService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const instanceService = accessor.get(IUniverInstanceService);

        const unitId = params?.unitId ?? instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getUnitId();

        if (unitId == null) {
            return false;
        }

        const renderObject = renderManagerService.getRenderById(unitId);
        if (renderObject == null) {
            return false;
        }

        const docSkeletonManagerService = renderObject.with(DocSkeletonManagerService);
        const viewModel = docSkeletonManagerService?.getViewModel();

        if (viewModel == null) {
            return false;
        }

        if (viewModel.getEditArea() === DocumentEditArea.BODY) {
            return false;
        }

        const skeleton = docSkeletonManagerService?.getSkeleton();
        if (skeleton == null) {
            return false;
        }

        const { scene } = renderObject;
        const transformer = scene.getTransformerByCreate();
        const docSelectionRenderService = renderObject.with(DocSelectionRenderService);

        // TODO: @JOCS, these codes bellow should be automatically executed?
        docSelectionManagerService.replaceDocRanges([]); // Clear text selection.
        transformer.clearSelectedObjects();
        docSelectionRenderService.setSegment('');
        docSelectionRenderService.setSegmentPage(-1);
        viewModel.setEditArea(DocumentEditArea.BODY);
        skeleton.calculate();
        renderObject.mainComponent?.makeDirty(true);

        queueMicrotask(() => {
            const docDataModel = instanceService.getUnit<DocumentDataModel>(unitId);
            const snapshot = docDataModel?.getSnapshot();
            if (snapshot == null) {
                return;
            }
            const offset = findFirstCursorOffset(snapshot);
            docSelectionManagerService.replaceDocRanges([
                {
                    startOffset: offset,
                    endOffset: offset,
                },
            ]);
        });

        commandService.executeCommand(SidebarDocHeaderFooterPanelOperation.id, { value: 'close' });

        return true;
    },
};
