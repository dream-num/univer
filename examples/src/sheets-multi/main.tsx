/**
 * Copyright 2023-present DreamNum Inc.
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

import 'react-mosaic-component/react-mosaic-component.css';
import './index.css';

import { LocaleType, LogLevel, Tools, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';

import { DEFAULT_WORKBOOK_DATA_DEMO } from '../data';
import { enUS, ruRU, zhCN } from '../locales';

function factory(id: string) {
    return function createUniverOnContainer() {
        const univer = new Univer({
            theme: defaultTheme,
            locale: LocaleType.ZH_CN,
            locales: {
                [LocaleType.ZH_CN]: zhCN,
                [LocaleType.EN_US]: enUS,
                [LocaleType.RU_RU]: ruRU,
            },
            logLevel: LogLevel.VERBOSE,
        });

        univer.registerPlugin(UniverRenderEnginePlugin);
        univer.registerPlugin(UniverUIPlugin, {
            container: id,
        });
        univer.registerPlugin(UniverDocsPlugin, {
            hasScroll: false,
        });
        univer.registerPlugin(UniverDocsUIPlugin);

        // sheets plugin
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsUIPlugin);

        // sheet feature plugins
        univer.registerPlugin(UniverSheetsNumfmtPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);

        // create univer sheet instance
        univer.createUniverSheet(Tools.deepClone(DEFAULT_WORKBOOK_DATA_DEMO));
    };
}

const TITLE_MAP: Record<ViewId, string> = {
    a: 'Sheet 1',
    b: 'Sheet 2',
    c: 'Sheet 3',
};

export type ViewId = 'a' | 'b' | 'c';

export function App() {
    useEffect(() => {
        factory('app-a')();
        factory('app-b')();
        factory('app-c')();
    }, []);

    return (
        <Mosaic<ViewId>
            renderTile={(id, path) => (
                <MosaicWindow<ViewId>
                    path={path}
                    title={TITLE_MAP[id]}
                    toolbarControls={<div />}
                >
                    <div id={`app-${id}`} style={{ height: '100%' }}>
                        {TITLE_MAP[id]}
                    </div>
                </MosaicWindow>
            )}
            initialValue={{
                direction: 'row',
                first: 'a',
                second: {
                    direction: 'column',
                    first: 'b',
                    second: 'c',
                },
            }}
        />
    );
};
createRoot(document.getElementById('container')!).render(<App />);
