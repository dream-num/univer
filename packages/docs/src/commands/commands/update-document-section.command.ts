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

import type { DocumentDataModel, ICommand, IDocumentBody, IMutationInfo, ISectionBreak } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import {
    ColumnSeparatorType,
    CommandType,
    containsInteriorInsertionOffset,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    DocxBreakType,
    generateRandomId,
    getBlockRangeInterval,
    getColumnGroupRangeInterval,
    getRichTextEditPath,
    getTableRangeInterval,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    PageOrientType,
    SectionType,
    TextX,
    TextXActionType,
    Tools,
    UniverInstanceType,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { getSectionContentWidth } from '../../utils/section-columns';
import { getTopLevelSectionBreaks } from '../../utils/sections';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export type IDocumentSectionConfig = Omit<ISectionBreak, 'sectionId' | 'startIndex'>;

export interface IDocumentSectionUpdate {
    sectionId: string;
    config: Partial<IDocumentSectionConfig>;
}

export interface IUpdateDocumentSectionCommandParams {
    unitId: string;
    updates: IDocumentSectionUpdate[];
}

export interface IInsertDocumentSectionBreakCommandParams {
    unitId: string;
    offset: number;
    sectionId: string;
    config?: Partial<IDocumentSectionConfig>;
    nextSectionType?: SectionType;
}

export interface IDeleteDocumentSectionBreakCommandParams {
    unitId: string;
    sectionId: string;
}

export interface IInsertDocumentColumnBreakCommandParams {
    unitId: string;
    offset: number;
}

export const UpdateDocumentSectionCommand: ICommand<IUpdateDocumentSectionCommandParams> = {
    id: 'doc.command.update-section',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params?.updates.length || params.updates.some(({ sectionId, config }) => !sectionId || Object.keys(config).length === 0)) {
            return false;
        }

        const instanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const documentDataModel = instanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel || documentDataModel.getDocumentStyle().documentFlavor !== DocumentFlavor.TRADITIONAL) {
            return false;
        }

        const body = documentDataModel.getBody();
        if (!body) {
            return false;
        }

        const updates = new Map(params.updates.map(({ sectionId, config }) => [sectionId, config]));
        if (updates.size !== params.updates.length) {
            return false;
        }
        const selectedIds = new Set(updates.keys());
        const sections = getTopLevelSectionBreaks(body)
            .filter((section) => selectedIds.has(section.sectionId))
            .sort((left, right) => left.startIndex - right.startIndex);
        if (sections.length !== selectedIds.size) {
            return false;
        }
        const documentStyle = documentDataModel.getDocumentStyle();
        if (sections.some((section) => !isValidSectionConfig(
            { ...section, ...updates.get(section.sectionId) },
            documentStyle
        ))) {
            return false;
        }

        const cursor = new MemoryCursor();
        const textX = new TextX();
        for (const section of sections) {
            textX.push({ t: TextXActionType.RETAIN, len: section.startIndex - cursor.cursor });
            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    sectionBreaks: [{
                        ...Tools.deepClone(section),
                        ...Tools.deepClone(updates.get(section.sectionId)!),
                        sectionId: section.sectionId,
                        startIndex: 0,
                    }],
                },
            });
            cursor.moveCursorTo(section.startIndex + 1);
        }

        const jsonX = JSONX.getInstance();
        const mutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: params.unitId,
                actions: jsonX.editOp(textX.serialize(), getRichTextEditPath(documentDataModel)),
                textRanges: null,
                noNeedSetTextRange: true,
                debounce: true,
                isEditing: false,
                trigger: UpdateDocumentSectionCommand.id,
            },
        };

        return Boolean(commandService.syncExecuteCommand(mutation.id, mutation.params));
    },
};

export const InsertDocumentSectionBreakCommand: ICommand<IInsertDocumentSectionBreakCommandParams> = {
    id: 'doc.command.insert-section-break',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const context = getTraditionalDocumentContext(accessor, params.unitId);
        if (!context || !params.sectionId || !Number.isInteger(params.offset) ||
            (params.nextSectionType != null && !isValidEnumValue(SectionType, params.nextSectionType))) {
            return false;
        }
        const { body, documentDataModel, commandService } = context;
        const insertedSection: ISectionBreak = {
            ...Tools.deepClone(params.config ?? {}),
            sectionId: params.sectionId,
            startIndex: params.offset,
        };
        if (!isValidTopLevelInsertionOffset(body, params.offset) ||
            body.sectionBreaks?.some((section) => section.sectionId === params.sectionId) ||
            !isValidSectionConfig(insertedSection, documentDataModel.getDocumentStyle())) {
            return false;
        }
        const nextSection = params.nextSectionType == null
            ? undefined
            : getTopLevelSectionBreaks(body).find((section) => section.startIndex >= params.offset);
        if (params.nextSectionType != null && !nextSection) {
            return false;
        }

        const textX = new TextX();
        textX.retain(params.offset);
        textX.insert(1, {
            dataStream: DataStreamTreeTokenType.SECTION_BREAK,
            sectionBreaks: [{
                ...insertedSection,
                startIndex: 0,
            }],
        });
        if (nextSection && params.nextSectionType != null) {
            textX.retain(nextSection.startIndex - params.offset);
            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    sectionBreaks: [{
                        ...Tools.deepClone(nextSection),
                        sectionType: params.nextSectionType,
                        startIndex: 0,
                    }],
                },
            });
        }
        return executeSectionTextX(commandService, documentDataModel, textX, InsertDocumentSectionBreakCommand.id);
    },
};

export const InsertDocumentColumnBreakCommand: ICommand<IInsertDocumentColumnBreakCommandParams> = {
    id: 'doc.command.insert-column-break',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const context = getTraditionalDocumentContext(accessor, params.unitId);
        if (!context || !isValidTopLevelInsertionOffset(context.body, params.offset)) {
            return false;
        }

        const textX = new TextX();
        textX.retain(params.offset);
        textX.insert(1, {
            dataStream: DataStreamTreeTokenType.COLUMN_BREAK,
            customRanges: [{
                startIndex: 0,
                endIndex: 0,
                rangeId: `docx-break-${generateRandomId()}`,
                rangeType: CustomRangeType.CUSTOM,
                wholeEntity: true,
                properties: { breakType: DocxBreakType.COLUMN },
            }],
        });
        return executeSectionTextX(context.commandService, context.documentDataModel, textX, InsertDocumentColumnBreakCommand.id);
    },
};

export const DeleteDocumentSectionBreakCommand: ICommand<IDeleteDocumentSectionBreakCommandParams> = {
    id: 'doc.command.delete-section-break',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const context = getTraditionalDocumentContext(accessor, params.unitId);
        if (!context || !params.sectionId) {
            return false;
        }
        const sections = getTopLevelSectionBreaks(context.body);
        if (sections.length <= 1) {
            return false;
        }
        const section = sections.find((item) => item.sectionId === params.sectionId);
        if (!section || section === sections[sections.length - 1]) {
            return false;
        }

        const textX = new TextX();
        textX.retain(section.startIndex);
        textX.delete(1);
        return executeSectionTextX(context.commandService, context.documentDataModel, textX, DeleteDocumentSectionBreakCommand.id);
    },
};

function getTraditionalDocumentContext(accessor: Parameters<typeof UpdateDocumentSectionCommand.handler>[0], unitId?: string) {
    if (!unitId) {
        return null;
    }
    const instanceService = accessor.get(IUniverInstanceService);
    const documentDataModel = instanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
    const body = documentDataModel?.getBody();
    if (!documentDataModel || !body || documentDataModel.getDocumentStyle().documentFlavor !== DocumentFlavor.TRADITIONAL) {
        return null;
    }
    return {
        body,
        documentDataModel,
        commandService: accessor.get(ICommandService),
    };
}

function isValidTopLevelInsertionOffset(body: IDocumentBody, offset: number): boolean {
    return Number.isInteger(offset) &&
        offset >= 0 &&
        offset <= body.dataStream.length &&
        !body.tables?.some((range) => containsInteriorInsertionOffset(getTableRangeInterval(range), offset)) &&
        !body.columnGroups?.some((range) => containsInteriorInsertionOffset(getColumnGroupRangeInterval(range), offset)) &&
        !body.blockRanges?.some((range) => containsInteriorInsertionOffset(getBlockRangeInterval(range), offset));
}

function isValidSectionConfig(
    section: ISectionBreak,
    documentStyle: ReturnType<DocumentDataModel['getDocumentStyle']>
): boolean {
    if (section.sectionType != null && !isValidEnumValue(SectionType, section.sectionType)) {
        return false;
    }
    if (section.pageOrient != null && !isValidEnumValue(PageOrientType, section.pageOrient)) {
        return false;
    }
    if (section.columnSeparatorType != null && !isValidEnumValue(ColumnSeparatorType, section.columnSeparatorType)) {
        return false;
    }
    if (section.pageNumberStart != null &&
        (!Number.isInteger(section.pageNumberStart) || section.pageNumberStart < 1)) {
        return false;
    }
    if (section.pageSize &&
        (!isPositiveFinite(section.pageSize.width) || !isPositiveFinite(section.pageSize.height))) {
        return false;
    }
    if ([section.marginTop, section.marginBottom, section.marginLeft, section.marginRight]
        .some((margin) => margin != null && (!Number.isFinite(margin) || margin < 0))) {
        return false;
    }
    const pageSize = section.pageSize ?? documentStyle.pageSize;
    const marginTop = section.marginTop ?? documentStyle.marginTop ?? 0;
    const marginBottom = section.marginBottom ?? documentStyle.marginBottom ?? 0;
    const marginLeft = section.marginLeft ?? documentStyle.marginLeft ?? 0;
    const marginRight = section.marginRight ?? documentStyle.marginRight ?? 0;
    if ((pageSize?.width != null && marginLeft + marginRight >= pageSize.width) ||
        (pageSize?.height != null && marginTop + marginBottom >= pageSize.height)) {
        return false;
    }
    const columns = section.columnProperties ?? [];
    if (columns.some(({ width, paddingEnd }) =>
        !Number.isFinite(width) || !Number.isFinite(paddingEnd) || width < 0 || paddingEnd < 0)) {
        return false;
    }
    return columns.reduce((sum, { width, paddingEnd }) => sum + width + paddingEnd, 0) <=
        getSectionContentWidth(documentStyle, section);
}

function isPositiveFinite(value: number | undefined): boolean {
    return value != null && Number.isFinite(value) && value > 0;
}

function isValidEnumValue(enumObject: object, value: number): boolean {
    return Object.values(enumObject).includes(value);
}

function executeSectionTextX(
    commandService: ICommandService,
    documentDataModel: DocumentDataModel,
    textX: TextX,
    trigger: string
): boolean {
    const actions = JSONX.getInstance().editOp(textX.serialize(), getRichTextEditPath(documentDataModel));
    return Boolean(commandService.syncExecuteCommand(RichTextEditingMutation.id, {
        unitId: documentDataModel.getUnitId(),
        actions,
        textRanges: null,
        noNeedSetTextRange: true,
        debounce: true,
        isEditing: false,
        trigger,
    }));
}
