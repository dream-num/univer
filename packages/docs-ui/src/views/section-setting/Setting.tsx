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

import type { ReactNode } from 'react';
import type { LocaleKey } from '../../locale/types';
import { ColumnSeparatorType, LocaleService, SectionType } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';
import { DocSectionSettingController } from '../../controllers/doc-section-setting.controller';
import { useSectionSetting } from './use-section-setting';

function SettingRow(props: { label: ReactNode; children: ReactNode }) {
    return (
        <div className="univer-grid univer-min-h-8 univer-items-center univer-gap-3" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 160px)' }}>
            <div
                className="
                  univer-min-w-0 univer-text-xs univer-leading-5 univer-text-gray-900
                  dark:!univer-text-gray-100
                "
            >
                {props.label}
            </div>
            <div className="univer-w-full univer-min-w-0">{props.children}</div>
        </div>
    );
}

export function SectionSetting() {
    const localeService = useDependency(LocaleService);
    const controller = useDependency(DocSectionSettingController);
    const setting = useSectionSetting();

    useEffect(() => {
        if (!setting.valid) {
            controller.closePanel();
        }
    }, [controller, setting.valid]);

    if (!setting.valid) {
        return null;
    }

    return (
        <div className="univer-box-border univer-w-full">
            {setting.selectedCount > 1 && (
                <div
                    className="
                      univer-mb-4 univer-text-xs univer-text-gray-600
                      dark:!univer-text-gray-300
                    "
                >
                    {localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.selectedSections', String(setting.selectedCount))}
                </div>
            )}
            <div className="univer-grid univer-gap-3">
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnCount')}>
                    <InputNumber className="univer-w-full" min={1} max={12} step={1} precision={0} value={setting.columnCount} onChange={(value) => value != null && setting.setColumnCount(value)} />
                </SettingRow>
                <SettingRow label={`${localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnGap')}(px)`}>
                    <InputNumber className="univer-w-full" min={0} max={1000} step={1} precision={1} value={setting.columnGap} onChange={(value) => value != null && setting.setColumnGap(value)} />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnSeparator')}>
                    <Select
                        className="univer-w-full"
                        value={setting.separatorType == null ? '' : String(setting.separatorType)}
                        options={[
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.none'), value: String(ColumnSeparatorType.NONE) },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.betweenColumns'), value: String(ColumnSeparatorType.BETWEEN_EACH_COLUMN) },
                        ]}
                        onChange={(value) => setting.setSeparatorType(Number(value))}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.sectionStart')}>
                    <Select
                        className="univer-w-full"
                        value={setting.sectionType == null ? '' : String(setting.sectionType)}
                        options={[
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.unspecified'), value: String(SectionType.SECTION_TYPE_UNSPECIFIED) },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.continuous'), value: String(SectionType.CONTINUOUS) },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.nextPage'), value: String(SectionType.NEXT_PAGE) },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.evenPage'), value: String(SectionType.EVEN_PAGE) },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.oddPage'), value: String(SectionType.ODD_PAGE) },
                        ]}
                        onChange={(value) => setting.setSectionType(Number(value))}
                    />
                </SettingRow>
            </div>
        </div>
    );
}
