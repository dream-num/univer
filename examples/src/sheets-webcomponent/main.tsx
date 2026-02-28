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

import { createComponent } from '@lit/react';
import { LocaleType, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { render } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
import { UniverNetworkPlugin } from '@univerjs/network';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
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
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsThreadCommentUIPlugin, UniverThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';
import { UniverWebComponentAdapterPlugin } from '@univerjs/ui-adapter-web-component';
import { UniverWatermarkPlugin } from '@univerjs/watermark';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import * as React from 'react';
import '../global.css';
import '@univerjs/sheets/facade';

@customElement('my-univer')
class MyWebComponent extends LitElement {
    override firstUpdated() {
        const container = this.renderRoot.querySelector('#containerId') as HTMLDivElement;

        const univer = new Univer({
            locale: LocaleType.ZH_CN,
            locales: {
                [LocaleType.ZH_CN]: zhCN,
            },
            logLevel: LogLevel.VERBOSE,
        });
        // basic plugins
        univer.registerPlugin(UniverNetworkPlugin);
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverRenderEnginePlugin);
        univer.registerPlugin(UniverUIPlugin, {
            container,
            ribbonType: 'classic',
        });
        // docs plugin
        univer.registerPlugin(UniverDocsPlugin);
        univer.registerPlugin(UniverDocsUIPlugin);
        // sheets plugin
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsUIPlugin);
        // sheet feature plugins
        univer.registerPlugin(UniverSheetsNumfmtPlugin);
        univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsFormulaUIPlugin);
        // sheet drawing plugins
        univer.registerPlugin(UniverSheetsDrawingPlugin);
        univer.registerPlugin(UniverSheetsDrawingUIPlugin);
        // sheet conditional formatting plugins
        univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
        univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);
        // sheet data validation plugins
        univer.registerPlugin(UniverSheetsDataValidationPlugin);
        univer.registerPlugin(UniverSheetsDataValidationUIPlugin);
        // sheet filter plugins
        univer.registerPlugin(UniverSheetsFilterPlugin);
        univer.registerPlugin(UniverSheetsFilterUIPlugin);
        // sheet sort plugins
        univer.registerPlugin(UniverSheetsSortPlugin);
        univer.registerPlugin(UniverSheetsSortUIPlugin);
        // sheet hyperlink plugins
        univer.registerPlugin(UniverSheetsHyperLinkPlugin);
        univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);
        // sheet table plugins
        univer.registerPlugin(UniverSheetsTablePlugin);
        univer.registerPlugin(UniverSheetsTableUIPlugin);
        // sheet note plugins
        univer.registerPlugin(UniverSheetsNotePlugin);
        univer.registerPlugin(UniverSheetsNoteUIPlugin);
        // sheet thread comment plugins
        univer.registerPlugin(UniverThreadCommentPlugin);
        univer.registerPlugin(UniverThreadCommentUIPlugin);
        univer.registerPlugin(UniverSheetsThreadCommentPlugin);
        univer.registerPlugin(UniverSheetsThreadCommentUIPlugin);
        // sheet find and replace plugins
        univer.registerPlugin(UniverSheetsFindReplacePlugin);
        // zen editor plugin
        univer.registerPlugin(UniverSheetsZenEditorPlugin);
        // crosshair highlight plugin
        univer.registerPlugin(UniverSheetsCrosshairHighlightPlugin);
        // watermark plugin
        univer.registerPlugin(UniverWatermarkPlugin);
        // adapter plugins
        univer.registerPlugin(UniverWebComponentAdapterPlugin);
        univer.registerPlugin(UniverVue3AdapterPlugin);

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);

        window.univerAPI = FUniver.newAPI(univer);
    }

    override render() {
        return html`
            <link rel="stylesheet" href="./main.css">
            <div style="height: 100%;" id="containerId" />
        `;
    }
}

const App = createComponent({
    tagName: 'my-univer',
    elementClass: MyWebComponent,
    react: React,
    events: {
        onMyEvent: 'my-event',
    },
});

render(<App />, document.getElementById('app')!);
