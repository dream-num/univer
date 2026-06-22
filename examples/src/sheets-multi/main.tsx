import { LocaleType, LogLevel, Tools, Univer, UniverInstanceType } from '@univerjs/core';
import { render } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { useEffect } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import '../global.css';

function factory(id: string) {
    return function createUniverOnContainer() {
        const univer = new Univer({
            locale: LocaleType.ZH_CN,
            locales: {
                [LocaleType.ZH_CN]: zhCN,
            },
            logLevel: LogLevel.VERBOSE,
        });

        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverRenderEnginePlugin);
        univer.registerPlugin(UniverUIPlugin, {
            container: id,
            ribbonType: 'classic',
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
                    <div id={`app-${id}`} className="univer-h-full">
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
