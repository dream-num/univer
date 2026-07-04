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
import type { ReactNode } from 'react';
import type { LocaleKey } from '../locale/types';
import {
    DocumentFlavor,
    IUniverInstanceService,
    LocaleService,
    MODERN_DOCUMENT_WIDTH,
    ModernDocumentWidthMode,
    PAGE_SIZE,
    PageOrientType,
    PAPER_TYPES,
    UniverInstanceType,
} from '@univerjs/core';
import { clsx, InputNumber, Select } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

export interface IPageSettingsProps {
    onClose: () => void;
    onConfirm: (settings: IPageSettings) => void;
}

export interface IPageSettings {
    mode: DocumentFlavor.TRADITIONAL | DocumentFlavor.MODERN;
    modernWidth: ModernDocumentWidthMode;
    paperSize: string;
    orientation: PageOrientType;
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    pageSize: {
        width: number;
        height: number;
    };
}

const MODERN_WIDTH_OPTIONS = [
    ModernDocumentWidthMode.NARROW,
    ModernDocumentWidthMode.MEDIUM,
    ModernDocumentWidthMode.WIDE,
];

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

const getModernWidthMode = (size?: ISize) => {
    const width = size?.width ?? MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM];

    return MODERN_WIDTH_OPTIONS.reduce((nearest, option) => {
        const nearestDistance = Math.abs(MODERN_DOCUMENT_WIDTH[nearest] - width);
        const currentDistance = Math.abs(MODERN_DOCUMENT_WIDTH[option] - width);

        return currentDistance < nearestDistance ? option : nearest;
    }, ModernDocumentWidthMode.MEDIUM);
};

function SettingsLabel(props: { children: ReactNode; muted?: boolean }) {
    const { children, muted } = props;

    return (
        <label
            className={clsx('univer-text-sm univer-font-medium', muted
                ? 'univer-text-gray-500'
                : `
                  univer-text-gray-900
                  dark:!univer-text-white
                `)}
        >
            {children}
        </label>
    );
}

export function PageSettings(props: IConfirmChildrenProps) {
    const { hooks } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const currentDoc = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)!;
    const documentStyle = currentDoc.getDocumentStyle();
    const localeService = useDependency(LocaleService);
    const [settings, setSettings] = useState<IPageSettings>(() => ({
        mode: documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL ? DocumentFlavor.TRADITIONAL : DocumentFlavor.MODERN,
        modernWidth: getModernWidthMode(documentStyle.pageSize),
        paperSize: getPaperSize(documentStyle.pageSize ?? PAGE_SIZE.A4),
        pageSize: {
            width: documentStyle.pageSize?.width ?? 0,
            height: documentStyle.pageSize?.height ?? 0,
        },
        orientation: documentStyle.pageOrient ?? PageOrientType.PORTRAIT,
        margins: {
            top: documentStyle.marginTop ?? 0,
            bottom: documentStyle.marginBottom ?? 0,
            left: documentStyle.marginLeft ?? 0,
            right: documentStyle.marginRight ?? 0,
        },
    }));

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        hooks.beforeClose = () => {
            return settings;
        };

        hooks.beforeConfirm = () => {
            return settings;
        };
    }, [settings]);

    const handlePaperSizeChange = (value: string) => {
        setSettings((prev) => ({ ...prev, paperSize: value, pageSize: PAGE_SIZE[value as PaperType] }));
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

    // const handleModeChange = (mode: IPageSettings['mode']) => {
    //     setSettings((prev) => ({ ...prev, mode }));
    // };

    const handleModernWidthChange = (modernWidth: ModernDocumentWidthMode) => {
        setSettings((prev) => ({ ...prev, modernWidth }));
    };

    return (
        <div className="univer-flex univer-flex-col univer-gap-4">
            {/* <div
                className="
                  univer-grid univer-grid-cols-2 univer-rounded-lg univer-bg-gray-100 univer-p-1
                  dark:!univer-bg-gray-800
                "
            >
                {([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL] as const).map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        className={clsx(`
                          univer-h-8 univer-cursor-pointer univer-rounded-md univer-border-none univer-bg-transparent
                          univer-text-sm univer-font-medium univer-text-gray-600 univer-transition-colors
                          hover:univer-bg-white hover:univer-text-gray-900
                          dark:!univer-text-gray-200
                          dark:hover:!univer-bg-gray-700
                        `, {
                            'univer-bg-white univer-text-gray-900 univer-shadow-sm dark:!univer-bg-gray-700 dark:!univer-text-white': settings.mode === mode,
                        })}
                        onClick={() => handleModeChange(mode)}
                    >
                        {localeService.t<LocaleKey>(mode === DocumentFlavor.MODERN ? 'docs-ui.page-settings.modern-mode' : 'docs-ui.page-settings.classic-mode')}
                    </button>
                ))}
            </div> */}

            {settings.mode === DocumentFlavor.MODERN
                ? (
                    <div className="univer-flex univer-flex-col univer-gap-2.5">
                        <SettingsLabel>{localeService.t<LocaleKey>('docs-ui.page-settings.modern-width')}</SettingsLabel>
                        <div className="univer-grid univer-grid-cols-3 univer-gap-2">
                            {MODERN_WIDTH_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={clsx(`
                                      univer-flex univer-h-16 univer-cursor-pointer univer-flex-col univer-items-center
                                      univer-justify-center univer-gap-1 univer-rounded-lg univer-border
                                      univer-border-solid univer-border-gray-200 univer-bg-white univer-text-sm
                                      univer-font-medium univer-text-gray-700 univer-transition-colors
                                      hover:univer-border-primary-500 hover:univer-text-primary-600
                                      dark:!univer-border-gray-600 dark:!univer-bg-gray-900 dark:!univer-text-gray-100
                                    `, {
                                        '!univer-border-primary-500 !univer-bg-primary-50 !univer-text-primary-600 dark:!univer-bg-primary-900': settings.modernWidth === option,
                                    })}
                                    onClick={() => handleModernWidthChange(option)}
                                >
                                    <span>{localeService.t(`docs-ui.page-settings.modern-width-${option}`)}</span>
                                    <span className="univer-text-xs univer-font-normal univer-text-gray-400">
                                        {MODERN_DOCUMENT_WIDTH[option]}
                                        px
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )
                : (
                    <>
                        <div className="univer-flex univer-flex-col univer-gap-2">
                            <SettingsLabel>
                                {localeService.t<LocaleKey>('docs-ui.page-settings.paper-size')}
                            </SettingsLabel>
                            <Select
                                value={settings.paperSize}
                                onChange={handlePaperSizeChange}
                                options={PAPER_TYPES.map((p) => ({
                                    label: localeService.t(`docs-ui.page-settings.page-size.${p.toLocaleLowerCase()}`),
                                    value: p,
                                }))}
                            />
                        </div>

                        <div className="univer-flex univer-flex-col univer-gap-2">
                            <SettingsLabel>{localeService.t<LocaleKey>('docs-ui.page-settings.custom-paper-size')}</SettingsLabel>
                            <div className="univer-flex univer-flex-col univer-gap-2.5">
                                <div className="univer-flex univer-gap-2.5">
                                    <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                                        <SettingsLabel muted>
                                            {localeService.t<LocaleKey>('docs-ui.page-settings.top')}
                                        </SettingsLabel>
                                        <InputNumber
                                            precision={2}
                                            min={0}
                                            max={settings.pageSize.height / 2}
                                            value={settings.margins.top}
                                            onChange={(e) => handleMarginChange('top', e)}
                                        />
                                    </div>
                                    <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                                        <SettingsLabel muted>
                                            {localeService.t<LocaleKey>('docs-ui.page-settings.bottom')}
                                        </SettingsLabel>
                                        <InputNumber
                                            precision={2}
                                            min={0}
                                            max={settings.pageSize.height / 2}
                                            value={settings.margins.bottom}
                                            onChange={(e) => handleMarginChange('bottom', e)}
                                        />
                                    </div>
                                </div>
                                <div className="univer-flex univer-gap-2.5">
                                    <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                                        <SettingsLabel muted>
                                            {localeService.t<LocaleKey>('docs-ui.page-settings.left')}
                                        </SettingsLabel>
                                        <InputNumber
                                            precision={2}
                                            min={0}
                                            max={settings.pageSize.width / 2}
                                            value={settings.margins.left}
                                            onChange={(e) => handleMarginChange('left', e)}
                                        />
                                    </div>
                                    <div className="univer-flex univer-flex-1 univer-flex-col univer-gap-2">
                                        <SettingsLabel muted>
                                            {localeService.t<LocaleKey>('docs-ui.page-settings.right')}
                                        </SettingsLabel>
                                        <InputNumber
                                            precision={2}
                                            min={0}
                                            max={settings.pageSize.width / 2}
                                            value={settings.margins.right}
                                            onChange={(e) => handleMarginChange('right', e)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
        </div>
    );
}

export const PAGE_SETTING_COMPONENT_ID = 'docs.component.page-setting';
