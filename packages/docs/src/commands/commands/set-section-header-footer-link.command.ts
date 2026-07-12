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

import type { DocumentDataModel, ICommand, IDocumentData, IMutationInfo, ISectionBreak, JSONXActions, SectionHeaderFooterKind, SectionHeaderFooterReferenceKey, SectionHeaderFooterVariant } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import {
    CommandType,
    DocumentFlavor,
    generateRandomId,
    getSectionHeaderFooterReferenceKey,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    resolveSectionHeaderFooterReference,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { getTopLevelSectionBreaks } from '../../utils/sections';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { getEmptyHeaderFooterBody } from './create-header-footer.command';

export interface ISetSectionHeaderFooterLinkCommandParams {
    unitId: string;
    sectionId: string;
    kind: SectionHeaderFooterKind;
    variant: SectionHeaderFooterVariant;
    linkedToPrevious: boolean;
    /** Stable id to use when unlinking. Generated automatically when omitted. */
    segmentId?: string;
}

interface ISectionHeaderFooterLinkContext {
    snapshot: IDocumentData;
    sections: ISectionBreak[];
    sectionIndex: number;
    storageIndex: number;
    key: SectionHeaderFooterReferenceKey;
}

export const SetSectionHeaderFooterLinkCommand: ICommand<ISetSectionHeaderFooterLinkCommandParams> = {
    id: 'doc.command.set-section-header-footer-link',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const instanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const documentDataModel = instanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        const snapshot = documentDataModel?.getSnapshot();
        if (!documentDataModel || !snapshot?.body || snapshot.documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL) {
            return false;
        }

        const sections = getTopLevelSectionBreaks(snapshot.body);
        const sectionIndex = sections.findIndex((section) => section.sectionId === params.sectionId);
        if (sectionIndex <= 0) {
            return false;
        }
        const storageIndex = snapshot.body.sectionBreaks?.findIndex((item) => item.sectionId === params.sectionId) ?? -1;
        if (storageIndex < 0) {
            return false;
        }

        const key = getSectionHeaderFooterReferenceKey(params.kind, params.variant);
        const context = { snapshot, sections, sectionIndex, storageIndex, key };
        const rawActions = params.linkedToPrevious
            ? buildLinkActions(context, params.kind)
            : buildUnlinkActions(context, params.kind, params.segmentId);
        if (!rawActions) {
            return false;
        }

        const mutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: params.unitId,
                actions: rawActions.reduce((actions, action) => JSONX.compose(actions, action as JSONXActions), null as JSONXActions),
                textRanges: null,
                noNeedSetTextRange: true,
                debounce: true,
                isEditing: false,
                trigger: SetSectionHeaderFooterLinkCommand.id,
            },
        };
        return Boolean(commandService.syncExecuteCommand(mutation.id, mutation.params));
    },
};

function buildLinkActions(context: ISectionHeaderFooterLinkContext, kind: SectionHeaderFooterKind): JSONXActions | null {
    const { snapshot, sections, sectionIndex, storageIndex, key } = context;
    const section = sections[sectionIndex];
    const explicitSegmentId = section[key];
    if (typeof explicitSegmentId !== 'string' || !explicitSegmentId) {
        return null;
    }

    const jsonX = JSONX.getInstance();
    const actions: JSONXActions = [jsonX.removeOp(['body', 'sectionBreaks', storageIndex, key], explicitSegmentId)!];
    const referenceKeys = kind === 'header'
        ? ['defaultHeaderId', 'firstPageHeaderId', 'evenPageHeaderId'] as const
        : ['defaultFooterId', 'firstPageFooterId', 'evenPageFooterId'] as const;
    const referencedByDocument = referenceKeys.some((referenceKey) => snapshot.documentStyle[referenceKey] === explicitSegmentId);
    const referencedBySection = sections.some((item) => referenceKeys.some((referenceKey) => (
        !(item.sectionId === section.sectionId && referenceKey === key) && item[referenceKey] === explicitSegmentId
    )));
    const resources = kind === 'header' ? snapshot.headers : snapshot.footers;
    if (!referencedByDocument && !referencedBySection && resources?.[explicitSegmentId]) {
        actions.push(jsonX.removeOp([kind === 'header' ? 'headers' : 'footers', explicitSegmentId], resources[explicitSegmentId])!);
    }
    return actions;
}

function buildUnlinkActions(
    context: ISectionHeaderFooterLinkContext,
    kind: SectionHeaderFooterKind,
    requestedSegmentId?: string
): JSONXActions | null {
    const { snapshot, sections, sectionIndex, storageIndex, key } = context;
    const explicitSegmentId = sections[sectionIndex][key];
    if (typeof explicitSegmentId === 'string' && explicitSegmentId) {
        return null;
    }

    const sourceSegmentId = resolveSectionHeaderFooterReference(snapshot.documentStyle, sections, sectionIndex - 1, key).segmentId;
    const segmentId = requestedSegmentId ?? generateRandomId(6);
    const resources = kind === 'header' ? snapshot.headers : snapshot.footers;
    if (resources?.[segmentId]) {
        return null;
    }
    const source = sourceSegmentId ? resources?.[sourceSegmentId] : undefined;
    const idKey = kind === 'header' ? 'headerId' : 'footerId';
    const resource = source
        ? { ...Tools.deepClone(source), [idKey]: segmentId }
        : { [idKey]: segmentId, body: getEmptyHeaderFooterBody() };
    const jsonX = JSONX.getInstance();
    return [
        jsonX.insertOp([kind === 'header' ? 'headers' : 'footers', segmentId], resource)!,
        jsonX.insertOp(['body', 'sectionBreaks', storageIndex, key], segmentId)!,
    ];
}
