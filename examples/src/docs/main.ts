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

import { FUniver, LocaleType, LogLevel, Univer, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDocsHyperLinkUIPlugin } from '@univerjs/docs-hyper-link-ui';
import { UniverDocsMentionUIPlugin } from '@univerjs/docs-mention-ui';
import { UniverDocsThreadCommentUIPlugin } from '@univerjs/docs-thread-comment-ui';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { DEFAULT_DOCUMENT_DATA_SIMPLE } from '@univerjs/mockdata';
import { UniverUIPlugin } from '@univerjs/ui';
import { enUS, faIR, ruRU, zhCN } from '../locales';

import '../global.css';

/* eslint-disable node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.EN_US]: enUS,
        [LocaleType.RU_RU]: ruRU,
        [LocaleType.FA_IR]: faIR,
    },
    logLevel: LogLevel.VERBOSE,
});

// core plugins
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverDebuggerPlugin);
univer.registerPlugin(UniverUIPlugin, {
    container: 'app',
});

univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin, {
    container: 'univerdoc',
    layout: {
        docContainerConfig: {
            innerLeft: false,
        },
    },
});

univer.registerPlugin(UniverDocsDrawingUIPlugin);
univer.registerPlugin(UniverDocsThreadCommentUIPlugin);
univer.registerPlugin(UniverDocsHyperLinkUIPlugin);
univer.registerPlugin(UniverDocsMentionUIPlugin);

if (!IS_E2E) {
    univer.createUnit(UniverInstanceType.UNIVER_DOC, DEFAULT_DOCUMENT_DATA_SIMPLE);
}

// use for console test
declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;
const injector = univer.__getInjector();
const userManagerService = injector.get(UserManagerService);

const mockUser = {
    userID: 'Owner_qxVnhPbQ',
    name: 'Owner',
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==',
    anonymous: false,
    canBindAnonymous: false,
};
userManagerService.setCurrentUser(mockUser);
window.univerAPI = FUniver.newAPI(univer);
