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

import type { Nullable } from '@univerjs/core';
import type { IUniverRPCMainThreadConfig } from '@univerjs/rpc';
import type { IThreadCommentMentionDataSource } from '@univerjs/thread-comment-ui';
import { LocaleType, LogLevel, Univer, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';

import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { FUniver } from '@univerjs/facade';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor';
import { IThreadCommentMentionDataService, UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { enUS, faIR, ruRU, viVN, zhCN, zhTW } from '../locales';

/* eslint-disable-next-line node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

const LOAD_LAZY_PLUGINS_TIMEOUT = 1_000;

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.EN_US]: enUS,
        [LocaleType.RU_RU]: ruRU,
        [LocaleType.ZH_TW]: zhTW,
        [LocaleType.VI_VN]: viVN,
        [LocaleType.FA_IR]: faIR,
    },
    logLevel: LogLevel.VERBOSE,
});

univer.registerPlugin(UniverRPCMainThreadPlugin, {
    workerURL: new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
} as IUniverRPCMainThreadConfig);

univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, { container: 'app' });
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
univer.registerPlugin(UniverSheetsUIPlugin);

// sheet feature plugins
univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(UniverSheetsZenEditorPlugin);
univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: true });
univer.registerPlugin(UniverSheetsFormulaPlugin, { notExecuteFormula: true });
univer.registerPlugin(UniverSheetsFormulaUIPlugin);
univer.registerPlugin(UniverSheetsDataValidationPlugin);
univer.registerPlugin(UniverSheetsDataValidationUIPlugin);

// filter plugin
univer.registerPlugin(UniverSheetsFilterPlugin);

// mock lazy load
setTimeout(() => {
    // hyperlink
    univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);
}, 500);

// sort
univer.registerPlugin(UniverSheetsSortUIPlugin);
// condition formatting
univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);

// drawing
univer.registerPlugin(UniverSheetsDrawingUIPlugin);

const mockUser = {
    userID: 'Owner_qxVnhPbQ',
    name: 'Owner',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==',
    anonymous: false,
    canBindAnonymous: false,
};

class CustomMentionDataService implements IThreadCommentMentionDataService {
    dataSource: Nullable<IThreadCommentMentionDataSource>;
    trigger: string = '@';

    async getMentions() {
        return [
            {
                id: mockUser.userID,
                label: mockUser.name,
                type: 'user',
                icon: mockUser.avatar,
            },
            {
                id: '2',
                label: 'User2',
                type: 'user',
                icon: mockUser.avatar,
            },
        ];
    }
}

// comment
univer.registerPlugin(UniverThreadCommentUIPlugin, { overrides: [[IThreadCommentMentionDataService, { useClass: CustomMentionDataService }]] });
univer.registerPlugin(UniverSheetsThreadCommentPlugin);

// debugger plugin
univer.registerPlugin(UniverDebuggerPlugin);

const injector = univer.__getInjector();
const userManagerService = injector.get(UserManagerService);
userManagerService.setCurrentUser(mockUser);

// create univer sheet instance
if (!IS_E2E) {
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
}

setTimeout(() => {
    import('./lazy').then((lazy) => {
        const plugins = lazy.default();
        plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));
    });
}, LOAD_LAZY_PLUGINS_TIMEOUT);

window.univer = univer;
window.univerAPI = FUniver.newAPI(univer);

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
        univerAPI?: ReturnType<typeof FUniver.newAPI>;
    }
}
