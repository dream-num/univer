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

import type { TableOfContentsFormat, TableOfContentsTabLeader } from '@univerjs/docs-toc';
import type { LocaleKey } from '../locale/types';
import { LocaleService } from '@univerjs/core';
import { Checkbox, clsx, Select } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

export const INSERT_TABLE_OF_CONTENTS_DIALOG_COMPONENT = 'doc.insert-table-of-contents-dialog';

export interface IInsertTableOfContentsDialogValue {
    levels: number;
    showPageNumbers: boolean;
    rightAlignPageNumbers: boolean;
    tabLeader: TableOfContentsTabLeader;
    format: TableOfContentsFormat;
}

export interface IInsertTableOfContentsDialogProps {
    options: IInsertTableOfContentsDialogValue;
    onChange: (value: IInsertTableOfContentsDialogValue) => void;
}

const FORMAT_OPTIONS: Array<[TableOfContentsFormat, LocaleKey]> = [
    ['fromTemplate', 'docs-toc-ui.tableOfContents.formatFromTemplate'],
    ['classic', 'docs-toc-ui.tableOfContents.formatClassic'],
    ['modern', 'docs-toc-ui.tableOfContents.formatModern'],
    ['simple', 'docs-toc-ui.tableOfContents.formatSimple'],
];

const LEADER_OPTIONS: Array<[TableOfContentsTabLeader, LocaleKey]> = [
    ['none', 'docs-toc-ui.tableOfContents.leaderNone'],
    ['dots', 'docs-toc-ui.tableOfContents.leaderDots'],
    ['dashes', 'docs-toc-ui.tableOfContents.leaderDashes'],
    ['underline', 'docs-toc-ui.tableOfContents.leaderUnderline'],
];

export function InsertTableOfContentsDialog(props: IInsertTableOfContentsDialogProps) {
    const localeService = useDependency(LocaleService);
    const [value, setValue] = useState(props.options);
    const update = (patch: Partial<IInsertTableOfContentsDialogValue>) => {
        const next = { ...value, ...patch };
        setValue(next);
        props.onChange(next);
    };
    const leader = { none: '', dots: '··········', dashes: '----------', underline: '__________' }[value.tabLeader];
    const indent = { fromTemplate: 18, classic: 14, modern: 20, simple: 12 }[value.format];

    return (
        <div className="univer-grid univer-gap-4 univer-py-2" data-testid="table-of-contents-insert-dialog">
            <div className="univer-grid univer-grid-cols-2 univer-gap-3">
                <label className="univer-grid univer-gap-1 univer-text-sm">
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.levels')}</span>
                    <Select
                        aria-label={localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.levels')}
                        value={String(value.levels)}
                        options={Array.from({ length: 9 }, (_, index) => ({ value: String(index + 1), label: String(index + 1) }))}
                        onChange={(levels) => update({ levels: Number(levels) })}
                    />
                </label>
                <label className="univer-grid univer-gap-1 univer-text-sm">
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.format')}</span>
                    <Select
                        aria-label={localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.format')}
                        value={value.format}
                        options={FORMAT_OPTIONS.map(([format, label]) => ({ value: format, label: localeService.t<LocaleKey>(label) }))}
                        onChange={(format) => update({ format: format as TableOfContentsFormat })}
                    />
                </label>
            </div>
            <div className="univer-grid univer-gap-2 univer-text-sm">
                <Checkbox
                    checked={value.showPageNumbers}
                    onChange={(checked) => update({
                        showPageNumbers: Boolean(checked),
                        rightAlignPageNumbers: Boolean(checked) && value.rightAlignPageNumbers,
                    })}
                >
                    {localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.showPageNumbers')}
                </Checkbox>
                <Checkbox
                    checked={value.rightAlignPageNumbers}
                    disabled={!value.showPageNumbers}
                    onChange={(checked) => update({ rightAlignPageNumbers: Boolean(checked) })}
                >
                    {localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.rightAlignPageNumbers')}
                </Checkbox>
                <label className="univer-flex univer-items-center univer-justify-between univer-gap-3">
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.tabLeader')}</span>
                    <Select
                        aria-label={localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.tabLeader')}
                        className="univer-min-w-40"
                        value={value.tabLeader}
                        disabled={!value.showPageNumbers || !value.rightAlignPageNumbers}
                        options={LEADER_OPTIONS.map(([tabLeader, label]) => ({ value: tabLeader, label: localeService.t<LocaleKey>(label) }))}
                        onChange={(tabLeader) => update({ tabLeader: tabLeader as TableOfContentsTabLeader })}
                    />
                </label>
            </div>
            <section
                className="
                  univer-rounded-lg univer-border univer-bg-gray-50 univer-p-4
                  dark:univer-bg-gray-900
                "
            >
                <div className="univer-mb-3 univer-text-xs univer-font-medium univer-text-gray-500">
                    {localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.preview')}
                </div>
                {Array.from({ length: Math.min(value.levels, 3) }, (_, index) => index).map((level) => (
                    <div
                        key={level}
                        className={clsx('univer-flex univer-items-baseline univer-text-sm', value.format === 'modern'
                            ? 'univer-mb-2'
                            : 'univer-mb-1')}
                        style={{ marginInlineStart: `${level * indent}px` }}
                    >
                        <span>
                            {localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.previewHeading')}
                            {' '}
                            {level + 1}
                        </span>
                        {value.showPageNumbers && value.rightAlignPageNumbers && (
                            <span
                                className="
                                  univer-mx-2 univer-flex-1 univer-overflow-hidden univer-whitespace-nowrap
                                  univer-text-gray-400
                                "
                            >
                                {leader}
                            </span>
                        )}
                        {value.showPageNumbers && <span className={value.rightAlignPageNumbers ? '' : 'univer-ml-2'}>{level + 1}</span>}
                    </div>
                ))}
            </section>
        </div>
    );
}
