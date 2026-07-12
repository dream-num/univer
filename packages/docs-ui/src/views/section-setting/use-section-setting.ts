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

const DEFAULT_SECTION_COLUMN_GAP = 18;

export interface ISectionSettingValues {
    columnCount: number | undefined;
    columnGap: number | undefined;
    separatorType: ColumnSeparatorType | undefined;
    sectionType: SectionType | undefined;
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

export function getSectionSettingValues(sections: ISectionBreak[]): ISectionSettingValues {
    return {
        columnCount: getCommonValue(sections.map(getSectionColumnCount)),
        columnGap: getCommonValue(sections.map(getSectionColumnGap)),
        separatorType: getCommonValue(sections.map((section) => section.columnSeparatorType ?? ColumnSeparatorType.NONE)),
        sectionType: getCommonValue(sections.map((section) => section.sectionType ?? SectionType.SECTION_TYPE_UNSPECIFIED)),
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

export function useSectionSetting() {
    const commandService = useDependency(ICommandService);
    const instanceService = useDependency(IUniverInstanceService);
    const selectionManager = useDependency(DocSelectionManagerService);
    const documentDataModel = useObservable(useMemo(
        () => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
        [instanceService]
    ));
    useObservable(selectionManager.textSelection$);
    useObservable(documentDataModel?.change$);
    const ranges = selectionManager.getDocRanges();
    const sections = documentDataModel?.getDocumentStyle().documentFlavor === DocumentFlavor.TRADITIONAL
        ? getSelectedSections(documentDataModel, ranges)
        : [];
    const values = getSectionSettingValues(sections);

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
        ...values,
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
    };
}
