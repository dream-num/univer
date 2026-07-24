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

import type { DocumentDataModel, IDocumentStyle, ISectionBreak, ITextRangeParam } from '@univerjs/core';
import type { IDocumentSectionConfig, IDocumentSectionUpdate } from '@univerjs/docs';
import {
    ColumnSeparatorType,
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    PageOrientType,
    SectionType,
    UniverInstanceType,
} from '@univerjs/core';
import {
    createSectionColumnProperties,
    DocSelectionManagerService,
    getTopLevelSectionBreaks,
    UpdateDocumentSectionCommand,
} from '@univerjs/docs';
import { useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';
import { combineLatest, map, startWith } from 'rxjs';
import { DocSectionSettingController } from '../../controllers/doc-section-setting.controller';

const DEFAULT_SECTION_COLUMN_GAP = 18;

export interface ISectionSettingValues {
    columnCount: number | undefined;
    columnGap: number | undefined;
    separatorType: ColumnSeparatorType | undefined;
    sectionType: SectionType | undefined;
    pageWidth: number | undefined;
    pageHeight: number | undefined;
    pageOrient: PageOrientType | undefined;
    marginTop: number | undefined;
    marginBottom: number | undefined;
    marginLeft: number | undefined;
    marginRight: number | undefined;
    pageNumberStart: number | undefined;
}

function getCommonValue<T>(values: T[]): T | undefined {
    const first = values[0];
    return values.every((value) => value === first) ? first : undefined;
}

function getSectionColumnCount(section: ISectionBreak): number {
    return section.columnProperties?.length || 1;
}

function getSectionColumnGap(section: ISectionBreak): number {
    return section.columnProperties?.[0]?.paddingEnd ?? DEFAULT_SECTION_COLUMN_GAP;
}

export function getSectionSettingValues(sections: ISectionBreak[], documentStyle: IDocumentStyle): ISectionSettingValues {
    return {
        columnCount: getCommonValue(sections.map(getSectionColumnCount)),
        columnGap: getCommonValue(sections.map(getSectionColumnGap)),
        separatorType: getCommonValue(sections.map((section) => section.columnSeparatorType ?? ColumnSeparatorType.NONE)),
        sectionType: getCommonValue(sections.map((section) => section.sectionType ?? SectionType.SECTION_TYPE_UNSPECIFIED)),
        pageWidth: getCommonValue(sections.map((section) => section.pageSize?.width ?? documentStyle.pageSize?.width)),
        pageHeight: getCommonValue(sections.map((section) => section.pageSize?.height ?? documentStyle.pageSize?.height)),
        pageOrient: getCommonValue(sections.map((section) => section.pageOrient ?? documentStyle.pageOrient)),
        marginTop: getCommonValue(sections.map((section) => section.marginTop ?? documentStyle.marginTop ?? 0)),
        marginBottom: getCommonValue(sections.map((section) => section.marginBottom ?? documentStyle.marginBottom ?? 0)),
        marginLeft: getCommonValue(sections.map((section) => section.marginLeft ?? documentStyle.marginLeft ?? 0)),
        marginRight: getCommonValue(sections.map((section) => section.marginRight ?? documentStyle.marginRight ?? 0)),
        pageNumberStart: getCommonValue(sections.map((section) => section.pageNumberStart ?? documentStyle.pageNumberStart ?? 1)),
    };
}

export function createSectionColumnUpdates(
    sections: ISectionBreak[],
    documentStyle: IDocumentStyle,
    change: { columnCount: number } | { columnGap: number }
): IDocumentSectionUpdate[] {
    return sections.map((section) => {
        const columnCount = 'columnCount' in change ? change.columnCount : getSectionColumnCount(section);
        const columnGap = 'columnGap' in change ? change.columnGap : getSectionColumnGap(section);
        return {
            sectionId: section.sectionId,
            config: {
                columnProperties: createSectionColumnProperties(documentStyle, section, columnCount, columnGap),
            },
        };
    });
}

export function createSectionOrientationUpdates(
    sections: ISectionBreak[],
    documentStyle: IDocumentStyle,
    pageOrient: PageOrientType
): IDocumentSectionUpdate[] {
    return sections.map((section) => {
        const currentOrient = section.pageOrient ?? documentStyle.pageOrient ?? PageOrientType.PORTRAIT;
        const currentPageSize = section.pageSize ?? documentStyle.pageSize;
        return {
            sectionId: section.sectionId,
            config: {
                pageOrient,
                ...(currentOrient !== pageOrient && currentPageSize?.width != null && currentPageSize.height != null
                    ? { pageSize: { width: currentPageSize.height, height: currentPageSize.width } }
                    : {}),
            },
        };
    });
}

export function getSelectedSections(documentDataModel: DocumentDataModel, ranges: Readonly<ITextRangeParam[]>): ISectionBreak[] {
    const body = documentDataModel.getBody();
    if (!body || ranges.length === 0 || ranges.some((range) => Boolean(range.segmentId))) {
        return [];
    }

    const sections = getTopLevelSectionBreaks(body);
    return sections.filter((section, index) => {
        const sectionStart = index === 0 ? 0 : sections[index - 1].startIndex + 1;
        return ranges.some((range) => {
            const rangeStart = Math.min(range.startOffset, range.endOffset);
            const rangeEnd = Math.max(range.startOffset, range.endOffset);
            return rangeStart <= section.startIndex && rangeEnd >= sectionStart;
        });
    });
}

function navigateToSection(
    controller: DocSectionSettingController,
    documentDataModel: DocumentDataModel | null | undefined,
    sections: ISectionBreak[],
    sectionId: string
): void {
    const index = sections.findIndex((section) => section.sectionId === sectionId);
    if (!documentDataModel || index < 0) {
        return;
    }
    controller.navigateToSectionEnd(
        documentDataModel.getUnitId(),
        index === 0 ? 0 : sections[index - 1].startIndex + 1,
        sections[index].startIndex
    );
}

export function useSectionSetting() {
    const commandService = useDependency(ICommandService);
    const instanceService = useDependency(IUniverInstanceService);
    const selectionManager = useDependency(DocSelectionManagerService);
    const controller = useDependency(DocSectionSettingController);
    const documentDataModel = useObservable(useMemo(
        () => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
        [instanceService]
    ));
    const resolveSections = () => documentDataModel?.getDocumentStyle().documentFlavor === DocumentFlavor.TRADITIONAL
        ? getSelectedSections(documentDataModel, selectionManager.getDocRanges())
        : [];
    const sections = useObservable(
        documentDataModel
            ? () => combineLatest([
                selectionManager.textSelection$.pipe(startWith(undefined)),
                documentDataModel.change$.pipe(startWith(undefined)),
            ]).pipe(map(resolveSections))
            : null,
        resolveSections(),
        false,
        [documentDataModel, selectionManager]
    );
    const documentStyle = documentDataModel?.getDocumentStyle() ?? {};
    const values = getSectionSettingValues(sections, documentStyle);
    const body = documentDataModel?.getBody();
    const allSections = documentDataModel?.getDocumentStyle().documentFlavor === DocumentFlavor.TRADITIONAL && body
        ? getTopLevelSectionBreaks(body)
        : [];

    const update = (updates: IDocumentSectionUpdate[]) => {
        if (!documentDataModel || updates.length === 0) {
            return Promise.resolve(false);
        }
        return commandService.executeCommand(UpdateDocumentSectionCommand.id, {
            unitId: documentDataModel.getUnitId(),
            updates,
        });
    };

    const updateAll = (config: Partial<IDocumentSectionConfig>) => update(
        sections.map((section) => ({ sectionId: section.sectionId, config }))
    );

    return {
        valid: Boolean(documentDataModel && sections.length > 0),
        selectedCount: sections.length,
        sectionOptions: allSections.map((section, index) => ({
            label: `#${index + 1}`,
            value: section.sectionId,
        })),
        selectedSectionId: sections.length === 1 ? sections[0].sectionId : undefined,
        ...values,
        selectSection(sectionId: string) {
            navigateToSection(controller, documentDataModel ?? undefined, allSections, sectionId);
        },
        setColumnCount(value: number) {
            const next = Math.max(1, Math.round(value));
            return update(documentDataModel
                ? createSectionColumnUpdates(sections, documentDataModel.getDocumentStyle(), { columnCount: next })
                : []);
        },
        setColumnGap(value: number) {
            const next = Math.max(0, value);
            return update(documentDataModel
                ? createSectionColumnUpdates(sections, documentDataModel.getDocumentStyle(), { columnGap: next })
                : []);
        },
        setSeparatorType(value: ColumnSeparatorType) {
            return updateAll({ columnSeparatorType: value });
        },
        setSectionType(value: SectionType) {
            return updateAll({ sectionType: value });
        },
        setPageWidth(value: number) {
            return update(sections.map((section) => ({
                sectionId: section.sectionId,
                config: { pageSize: { ...documentStyle.pageSize, ...section.pageSize, width: Math.max(1, value) } },
            })));
        },
        setPageHeight(value: number) {
            return update(sections.map((section) => ({
                sectionId: section.sectionId,
                config: { pageSize: { ...documentStyle.pageSize, ...section.pageSize, height: Math.max(1, value) } },
            })));
        },
        setPageOrient(value: PageOrientType) {
            return update(createSectionOrientationUpdates(sections, documentStyle, value));
        },
        setMarginTop(value: number) {
            return updateAll({ marginTop: Math.max(0, value) });
        },
        setMarginBottom(value: number) {
            return updateAll({ marginBottom: Math.max(0, value) });
        },
        setMarginLeft(value: number) {
            return updateAll({ marginLeft: Math.max(0, value) });
        },
        setMarginRight(value: number) {
            return updateAll({ marginRight: Math.max(0, value) });
        },
        setPageNumberStart(value: number) {
            return updateAll({ pageNumberStart: Math.max(1, Math.round(value)) });
        },
    };
}
