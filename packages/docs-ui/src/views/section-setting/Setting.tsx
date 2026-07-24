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
import { ColumnSeparatorType, LocaleService, PageOrientType, SectionType } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect } from 'react';
import { DocSectionSettingController } from '../../controllers/doc-section-setting.controller';
import { useSectionSetting } from './use-section-setting';

function SettingRow(props: { label: ReactNode; unit?: string; children: ReactNode }) {
    return (
        <div className="univer-grid univer-min-h-8 univer-items-center univer-gap-3" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 160px)' }}>
            <div
                className="
                  univer-min-w-0 univer-text-xs univer-leading-5 univer-text-gray-900
                  dark:!univer-text-gray-100
                "
            >
                {props.label}
                {props.unit}
            </div>
            <div className="univer-w-full univer-min-w-0">{props.children}</div>
        </div>
    );
}

export function SectionSetting() {
    const localeService = useDependency(LocaleService);
    const controller = useDependency(DocSectionSettingController);
    const setting = useSectionSetting();
    useObservable(localeService.currentLocale$);

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
                    {localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.selectedSections', `${setting.selectedCount}`)}
                </div>
            )}
            <div className="univer-grid univer-gap-3">
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.slider.sectionSetting')}>
                    <Select
                        className="univer-w-full"
                        value={setting.selectedSectionId ?? ''}
                        options={[
                            ...(setting.selectedSectionId == null
                                ? [{
                                    label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.multipleValues'),
                                    value: '',
                                    disabled: true,
                                }]
                                : []),
                            ...setting.sectionOptions,
                        ]}
                        onChange={setting.selectSection}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnCount')}>
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnCount')}
                        className="univer-w-full"
                        min={1}
                        max={12}
                        step={1}
                        precision={0}
                        value={setting.columnCount}
                        onChange={(value) => value != null && setting.setColumnCount(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnGap')} unit=" (px)">
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnGap')}
                        className="univer-w-full"
                        min={0}
                        max={1000}
                        step={1}
                        precision={1}
                        value={setting.columnGap}
                        onChange={(value) => value != null && setting.setColumnGap(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnSeparator')}>
                    <Select
                        className="univer-w-full"
                        value={setting.separatorType == null ? '' : `${setting.separatorType}`}
                        options={[
                            ...(setting.separatorType == null
                                ? [{
                                    label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.multipleValues'),
                                    value: '',
                                    disabled: true,
                                }]
                                : []),
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.none'), value: `${ColumnSeparatorType.NONE}` },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.betweenColumns'), value: `${ColumnSeparatorType.BETWEEN_EACH_COLUMN}` },
                        ]}
                        onChange={(value) => setting.setSeparatorType(Number(value))}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.sectionStart')}>
                    <Select
                        className="univer-w-full"
                        value={setting.sectionType == null ? '' : `${setting.sectionType}`}
                        options={[
                            ...(setting.sectionType == null
                                ? [{
                                    label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.multipleValues'),
                                    value: '',
                                    disabled: true,
                                }]
                                : []),
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.unspecified'), value: `${SectionType.SECTION_TYPE_UNSPECIFIED}` },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.continuous'), value: `${SectionType.CONTINUOUS}` },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.nextColumn'), value: `${SectionType.NEXT_COLUMN}` },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.nextPage'), value: `${SectionType.NEXT_PAGE}` },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.evenPage'), value: `${SectionType.EVEN_PAGE}` },
                            { label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.oddPage'), value: `${SectionType.ODD_PAGE}` },
                        ]}
                        onChange={(value) => setting.setSectionType(Number(value))}
                    />
                </SettingRow>
                <div className="univer-pt-2 univer-text-sm univer-font-medium">
                    {localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageSetup')}
                </div>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageWidth')} unit=" (px)">
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageWidth')}
                        className="univer-w-full"
                        min={1}
                        step={1}
                        precision={1}
                        value={setting.pageWidth}
                        onChange={(value) => value != null && setting.setPageWidth(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageHeight')} unit=" (px)">
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageHeight')}
                        className="univer-w-full"
                        min={1}
                        step={1}
                        precision={1}
                        value={setting.pageHeight}
                        onChange={(value) => value != null && setting.setPageHeight(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.page-settings.orientation')}>
                    <Select
                        className="univer-w-full"
                        value={setting.pageOrient == null ? '' : `${setting.pageOrient}`}
                        options={[
                            ...(setting.pageOrient == null
                                ? [{
                                    label: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.multipleValues'),
                                    value: '',
                                    disabled: true,
                                }]
                                : []),
                            { label: localeService.t<LocaleKey>('docs-ui.page-settings.portrait'), value: `${PageOrientType.PORTRAIT}` },
                            { label: localeService.t<LocaleKey>('docs-ui.page-settings.landscape'), value: `${PageOrientType.LANDSCAPE}` },
                        ]}
                        onChange={(value) => setting.setPageOrient(Number(value))}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.page-settings.top')} unit=" (px)">
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.page-settings.top')}
                        className="univer-w-full"
                        min={0}
                        step={1}
                        precision={1}
                        value={setting.marginTop}
                        onChange={(value) => value != null && setting.setMarginTop(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.page-settings.bottom')} unit=" (px)">
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.page-settings.bottom')}
                        className="univer-w-full"
                        min={0}
                        step={1}
                        precision={1}
                        value={setting.marginBottom}
                        onChange={(value) => value != null && setting.setMarginBottom(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.page-settings.left')} unit=" (px)">
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.page-settings.left')}
                        className="univer-w-full"
                        min={0}
                        step={1}
                        precision={1}
                        value={setting.marginLeft}
                        onChange={(value) => value != null && setting.setMarginLeft(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.page-settings.right')} unit=" (px)">
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.page-settings.right')}
                        className="univer-w-full"
                        min={0}
                        step={1}
                        precision={1}
                        value={setting.marginRight}
                        onChange={(value) => value != null && setting.setMarginRight(value)}
                    />
                </SettingRow>
                <SettingRow label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageNumberStart')}>
                    <InputNumber
                        aria-label={localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageNumberStart')}
                        className="univer-w-full"
                        min={1}
                        step={1}
                        precision={0}
                        value={setting.pageNumberStart}
                        onChange={(value) => value != null && setting.setPageNumberStart(value)}
                    />
                </SettingRow>
            </div>
        </div>
    );
}
