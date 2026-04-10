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

import type { Theme } from '@univerjs/themes';
import { LocaleType, LogLevel, ThemeService, Univer, UniverInstanceType } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import enUS from '@univerjs/mockdata/locales/en-US';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';
import { UniverSheetsNotePlugin } from '@univerjs/sheets-note';
import { UniverSheetsNoteUIPlugin } from '@univerjs/sheets-note-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverSheetsTablePlugin } from '@univerjs/sheets-table';
import { UniverSheetsTableUIPlugin } from '@univerjs/sheets-table-ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import { UniverUIPlugin } from '@univerjs/ui';
import { useEffect, useRef } from 'react';
import { PREVIEW_CONTAINER_ID } from '../constants';

export function UniverPreview(props: { theme: Theme; darkMode: boolean }) {
    const { theme, darkMode } = props;
    const univerRef = useRef<Univer | null>(null);

    useEffect(() => {
        const univer = new Univer({
            theme,
            darkMode,
            locale: LocaleType.EN_US,
            locales: {
                [LocaleType.EN_US]: enUS,
            },
            logLevel: LogLevel.ERROR,
        });

        univer.registerPlugins([
            [UniverDocsPlugin],
            [UniverRenderEnginePlugin],
            [UniverUIPlugin, {
                container: PREVIEW_CONTAINER_ID,
                ribbonType: 'classic',
            }],
            [UniverDocsUIPlugin],
            [UniverSheetsPlugin, {
                autoHeightForMergedCells: true,
            }],
            [UniverSheetsUIPlugin],
            [UniverSheetsNumfmtPlugin],
            [UniverSheetsZenEditorPlugin],
            [UniverFormulaEnginePlugin],
            [UniverSheetsFormulaPlugin],
            [UniverSheetsFormulaUIPlugin],
            [UniverSheetsDataValidationPlugin],
            [UniverSheetsDataValidationUIPlugin],
            [UniverSheetsConditionalFormattingPlugin],
            [UniverSheetsConditionalFormattingUIPlugin],
            [UniverSheetsFilterPlugin],
            [UniverSheetsFilterUIPlugin, { useRemoteFilterValuesGenerator: false }],
            [UniverSheetsSortPlugin],
            [UniverSheetsSortUIPlugin],
            [UniverSheetsHyperLinkPlugin],
            [UniverSheetsHyperLinkUIPlugin],
            [UniverSheetsTablePlugin],
            [UniverSheetsTableUIPlugin],
            [UniverSheetsNotePlugin],
            [UniverSheetsNoteUIPlugin],
            [UniverSheetsNumfmtUIPlugin],
        ]);

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
        univerRef.current = univer;

        return () => {
            univer.dispose();
            univerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (univerRef.current) {
            univerRef.current.__getInjector().get(ThemeService).setTheme(theme);
        }
    }, [theme]);

    useEffect(() => {
        if (univerRef.current) {
            univerRef.current.__getInjector().get(ThemeService).setDarkMode(darkMode);
        }
    }, [darkMode]);

    return (
        <div
            id={PREVIEW_CONTAINER_ID}
            className={clsx(`
              univer-h-full univer-min-h-[520px] univer-w-full univer-overflow-hidden univer-rounded-[20px]
              univer-bg-white
            `)}
        />
    );
}
