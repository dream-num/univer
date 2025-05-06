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

import { LocaleType, LogLevel, Tools, Univer, UniverInstanceType } from '@univerjs/core';
import { render } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { useEffect } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { enUS, faIR, frFR, ruRU, zhCN } from '../locales';

import 'react-mosaic-component/react-mosaic-component.css';

import '../global.css';

function factory(id: string) {
    return function createUniverOnContainer() {
        const univer = new Univer({
            locale: LocaleType.ZH_CN,
            locales: {
                [LocaleType.ZH_CN]: zhCN,
                [LocaleType.EN_US]: enUS,
                [LocaleType.FR_FR]: frFR,
                [LocaleType.RU_RU]: ruRU,
                [LocaleType.FA_IR]: faIR,
            },
            logLevel: LogLevel.VERBOSE,
        });

        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverRenderEnginePlugin);
        univer.registerPlugin(UniverUIPlugin, {
            container: id,
        });
        univer.registerPlugin(UniverDocsPlugin);
        univer.registerPlugin(UniverDocsUIPlugin);

        // sheets plugin
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsUIPlugin);
        univer.registerPlugin(UniverSheetsFormulaUIPlugin);
        // sheet feature plugins
        univer.registerPlugin(UniverSheetsNumfmtPlugin);
        univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);

        const data = Tools.deepClone(DEFAULT_WORKBOOK_DATA_DEMO);
        data.id = id;
        // create univer sheet instance
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, data);
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

render(<App />, document.getElementById('app')!);
