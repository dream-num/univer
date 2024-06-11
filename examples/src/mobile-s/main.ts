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

import { LocaleType, LogLevel, Univer, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsMobileUIPlugin } from '@univerjs/sheets-ui';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import type { FUniver } from '@univerjs/facade';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterMobileUIPlugin } from '@univerjs/sheets-filter-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import type { IUniverRPCMainThreadConfig } from '@univerjs/rpc';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsFormulaMobilePlugin } from '@univerjs/sheets-formula';
import { UniverSheetsDataValidationMobilePlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsConditionalFormattingMobileUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { enUS } from '../locales';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '../data/sheets/demo/default-workbook-data-demo';

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: enUS,
    },
    logLevel: LogLevel.VERBOSE,
});

univer.registerPlugin(UniverFormulaEnginePlugin);

// core plugins
univer.registerPlugin(UniverDocsPlugin, {
    hasScroll: false,
});
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverMobileUIPlugin, { container: 'app' });
univer.registerPlugin(UniverRPCMainThreadPlugin, {
    workerURL: './worker.js',
} as IUniverRPCMainThreadConfig);

univer.registerPlugin(UniverDocsUIPlugin);

univer.registerPlugin(UniverSheetsPlugin);

univer.registerPlugin(UniverSheetsMobileUIPlugin);

// sheet feature plugins
univer.registerPlugin(UniverSheetsFilterPlugin);
univer.registerPlugin(UniverSheetsFilterMobileUIPlugin);
univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(UniverSheetsFormulaMobilePlugin);

univer.registerPlugin(UniverSheetsConditionalFormattingMobileUIPlugin);
univer.registerPlugin(UniverSheetsDataValidationMobilePlugin);

const mockUser = {
    userID: 'Owner_qxVnhPbQ',
    name: 'Owner',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==',
    anonymous: false,
    canBindAnonymous: false,
};

const injector = univer.__getInjector();
const userManagerService = injector.get(UserManagerService);
userManagerService.currentUser = mockUser;

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
        univerAPI?: ReturnType<typeof FUniver.newAPI>;
    }
}

// setTimeout(() => {
//     import('./lazy').then((lazy) => {
//         const plugins = lazy.default();
//         plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));
//     });
// }, LOAD_LAZY_PLUGINS_TIMEOUT);

univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
