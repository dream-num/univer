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

import type { DocumentDataModel, ISize, PaperType } from '@univerjs/core';
import type { IConfirmChildrenProps } from '@univerjs/ui';
import { IUniverInstanceService, LocaleService, PAGE_SIZE, PageOrientType, PAPER_TYPES, UniverInstanceType } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';

export interface IPageSettingsProps {
    onClose: () => void;
    onConfirm: (settings: IPageSettings) => void;
}

export interface IPageSettings {
    paperSize: string;
    orientation: PageOrientType;
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

const getPaperSize = (size: ISize) => {
    const keys = Object.keys(PAGE_SIZE);

    const result = keys.find((key) => {
        const { width, height } = PAGE_SIZE[key as PaperType];
        if (size.width === width && size.height === height) {
            return true;
        }

        return false;
    });

    return result ?? 'A4';
};

export function PageSettings(props: IConfirmChildrenProps) {
    const { hooks } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const currentDoc = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)!;
    const documentStyle = currentDoc.getDocumentStyle();
    const localeService = useDependency(LocaleService);
    const [settings, setSettings] = useState<IPageSettings>(() => ({
        paperSize: getPaperSize(documentStyle.pageSize!),
        orientation: documentStyle.pageOrient ?? PageOrientType.PORTRAIT,
        margins: {
            top: documentStyle.marginTop ?? 0,
            bottom: documentStyle.marginBottom ?? 0,
            left: documentStyle.marginLeft ?? 0,
            right: documentStyle.marginRight ?? 0,
        },
    }));

    useEffect(() => {
        hooks.beforeClose = () => {
            return settings;
        };

        hooks.beforeConfirm = () => {
            return settings;
        };
    }, [settings]);

    const handlePaperSizeChange = (value: string) => {
        setSettings((prev) => ({ ...prev, paperSize: value }));
    };

    const handleOrientationChange = (value: PageOrientType) => {
        setSettings((prev) => ({ ...prev, orientation: value }));
    };

    const handleMarginChange = (position: keyof IPageSettings['margins'], value: number | null) => {
        setSettings((prev) => ({
            ...prev,
            margins: {
                ...prev.margins,
                [position]: value || 0,
            },
        }));
    };

    return (
        <div className="univer-flex univer-flex-col univer-gap-4">
            <div className="univer-flex univer-flex-col univer-gap-2">
                <label
                    className={`
                      univer-text-sm univer-font-medium univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    {localeService.t('page-settings.paper-size')}
                </label>
                <Select
                    value={settings.paperSize}
                    onChange={handlePaperSizeChange}
                    options={PAPER_TYPES.map((p) => ({
                        label: localeService.t(`page-settings.page-size.${p.toLocaleLowerCase()}`),
                        value: p,
                    }))}
                />
            </div>

            <div className="univer-flex univer-flex-col univer-gap-2">
                <label
                    className={`
                      univer-text-sm univer-font-medium univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    {localeService.t('page-settings.custom-paper-size')}
                </label>
                <div className="univer-flex univer-flex-col univer-gap-2.5">
                    <div className="univer-flex univer-gap-2.5">
                        <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                            <label className="univer-text-sm univer-font-medium univer-text-gray-500">
                                {localeService.t('page-settings.top')}
                            </label>
                            <InputNumber
                                value={settings.margins.top}
                                onChange={(e) => handleMarginChange('top', e)}
                            />
                        </div>
                        <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                            <label className="univer-text-sm univer-font-medium univer-text-gray-500">
                                {localeService.t('page-settings.bottom')}
                            </label>
                            <InputNumber
                                value={settings.margins.bottom}
                                onChange={(e) => handleMarginChange('bottom', e)}
                            />
                        </div>
                    </div>
                    <div className="univer-flex univer-gap-2.5">
                        <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                            <label className="univer-text-sm univer-font-medium univer-text-gray-500">
                                {localeService.t('page-settings.left')}
                            </label>
                            <InputNumber
                                value={settings.margins.left}
                                onChange={(e) => handleMarginChange('left', e)}
                            />
                        </div>
                        <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                            <label className="univer-text-sm univer-font-medium univer-text-gray-500">
                                {localeService.t('page-settings.right')}
                            </label>
                            <InputNumber
                                value={settings.margins.right}
                                onChange={(e) => handleMarginChange('right', e)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const PAGE_SETTING_COMPONENT_ID = 'docs.component.page-setting';
