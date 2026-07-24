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
    useObservable(localeService.currentLocale$);
    const labels = {
        section: localeService.t<LocaleKey>('docs-ui.doc.slider.sectionSetting'),
        selectedSections: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.selectedSections', String(setting.selectedCount)),
        columnCount: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnCount'),
        columnGap: `${localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnGap')}(px)`,
        columnSeparator: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.columnSeparator'),
        none: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.none'),
        betweenColumns: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.betweenColumns'),
        sectionStart: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.sectionStart'),
        unspecified: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.unspecified'),
        continuous: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.continuous'),
        nextColumn: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.nextColumn'),
        nextPage: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.nextPage'),
        evenPage: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.evenPage'),
        oddPage: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.oddPage'),
        pageSetup: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageSetup'),
        pageWidth: `${localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageWidth')} (px)`,
        pageHeight: `${localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageHeight')} (px)`,
        orientation: localeService.t<LocaleKey>('docs-ui.page-settings.orientation'),
        portrait: localeService.t<LocaleKey>('docs-ui.page-settings.portrait'),
        landscape: localeService.t<LocaleKey>('docs-ui.page-settings.landscape'),
        marginTop: `${localeService.t<LocaleKey>('docs-ui.page-settings.top')} (px)`,
        marginBottom: `${localeService.t<LocaleKey>('docs-ui.page-settings.bottom')} (px)`,
        marginLeft: `${localeService.t<LocaleKey>('docs-ui.page-settings.left')} (px)`,
        marginRight: `${localeService.t<LocaleKey>('docs-ui.page-settings.right')} (px)`,
        pageNumberStart: localeService.t<LocaleKey>('docs-ui.doc.sectionSetting.pageNumberStart'),
    };

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
                    {labels.selectedSections}
                </div>
            )}
            <div className="univer-grid univer-gap-3">
                <SettingRow label={labels.section}>
                    <Select
                        aria-label={String(labels.section)}
                        className="univer-w-full"
                        value={setting.selectedSectionId ?? ''}
                        options={setting.sectionOptions}
                        onChange={setting.selectSection}
                    />
                </SettingRow>
                <SettingRow label={labels.columnCount}>
                    <InputNumber aria-label={String(labels.columnCount)} className="univer-w-full" min={1} max={12} step={1} precision={0} value={setting.columnCount} onChange={(value) => value != null && setting.setColumnCount(value)} />
                </SettingRow>
                <SettingRow label={labels.columnGap}>
                    <InputNumber aria-label={String(labels.columnGap)} className="univer-w-full" min={0} max={1000} step={1} precision={1} value={setting.columnGap} onChange={(value) => value != null && setting.setColumnGap(value)} />
                </SettingRow>
                <SettingRow label={labels.columnSeparator}>
                    <Select
                        aria-label={String(labels.columnSeparator)}
                        className="univer-w-full"
                        value={setting.separatorType == null ? '' : String(setting.separatorType)}
                        options={[
                            { label: labels.none, value: String(ColumnSeparatorType.NONE) },
                            { label: labels.betweenColumns, value: String(ColumnSeparatorType.BETWEEN_EACH_COLUMN) },
                        ]}
                        onChange={(value) => setting.setSeparatorType(Number(value))}
                    />
                </SettingRow>
                <SettingRow label={labels.sectionStart}>
                    <Select
                        aria-label={String(labels.sectionStart)}
                        className="univer-w-full"
                        value={setting.sectionType == null ? '' : String(setting.sectionType)}
                        options={[
                            { label: labels.unspecified, value: String(SectionType.SECTION_TYPE_UNSPECIFIED) },
                            { label: labels.continuous, value: String(SectionType.CONTINUOUS) },
                            { label: labels.nextColumn, value: String(SectionType.NEXT_COLUMN) },
                            { label: labels.nextPage, value: String(SectionType.NEXT_PAGE) },
                            { label: labels.evenPage, value: String(SectionType.EVEN_PAGE) },
                            { label: labels.oddPage, value: String(SectionType.ODD_PAGE) },
                        ]}
                        onChange={(value) => setting.setSectionType(Number(value))}
                    />
                </SettingRow>
                <div className="univer-pt-2 univer-text-sm univer-font-medium">{labels.pageSetup}</div>
                <SettingRow label={labels.pageWidth}>
                    <InputNumber aria-label={String(labels.pageWidth)} className="univer-w-full" min={1} step={1} precision={1} value={setting.pageWidth} onChange={(value) => value != null && setting.setPageWidth(value)} />
                </SettingRow>
                <SettingRow label={labels.pageHeight}>
                    <InputNumber aria-label={String(labels.pageHeight)} className="univer-w-full" min={1} step={1} precision={1} value={setting.pageHeight} onChange={(value) => value != null && setting.setPageHeight(value)} />
                </SettingRow>
                <SettingRow label={labels.orientation}>
                    <Select
                        aria-label={String(labels.orientation)}
                        className="univer-w-full"
                        value={setting.pageOrient == null ? '' : String(setting.pageOrient)}
                        options={[
                            { label: labels.portrait, value: String(PageOrientType.PORTRAIT) },
                            { label: labels.landscape, value: String(PageOrientType.LANDSCAPE) },
                        ]}
                        onChange={(value) => setting.setPageOrient(Number(value))}
                    />
                </SettingRow>
                <SettingRow label={labels.marginTop}>
                    <InputNumber aria-label={String(labels.marginTop)} className="univer-w-full" min={0} step={1} precision={1} value={setting.marginTop} onChange={(value) => value != null && setting.setMarginTop(value)} />
                </SettingRow>
                <SettingRow label={labels.marginBottom}>
                    <InputNumber aria-label={String(labels.marginBottom)} className="univer-w-full" min={0} step={1} precision={1} value={setting.marginBottom} onChange={(value) => value != null && setting.setMarginBottom(value)} />
                </SettingRow>
                <SettingRow label={labels.marginLeft}>
                    <InputNumber aria-label={String(labels.marginLeft)} className="univer-w-full" min={0} step={1} precision={1} value={setting.marginLeft} onChange={(value) => value != null && setting.setMarginLeft(value)} />
                </SettingRow>
                <SettingRow label={labels.marginRight}>
                    <InputNumber aria-label={String(labels.marginRight)} className="univer-w-full" min={0} step={1} precision={1} value={setting.marginRight} onChange={(value) => value != null && setting.setMarginRight(value)} />
                </SettingRow>
                <SettingRow label={labels.pageNumberStart}>
                    <InputNumber aria-label={String(labels.pageNumberStart)} className="univer-w-full" min={1} step={1} precision={0} value={setting.pageNumberStart} onChange={(value) => value != null && setting.setPageNumberStart(value)} />
                </SettingRow>
            </div>
        </div>
    );
}
