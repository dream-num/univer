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

import type { IDocumentBody, Nullable } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { HtmlToUDMService } from '../html-to-udm/converter';
import PastePluginLark from '../html-to-udm/paste-plugins/plugin-lark';
import PastePluginWord from '../html-to-udm/paste-plugins/plugin-word';
import { UDMToHtmlService } from '../udm-to-html/convertor';

HtmlToUDMService.use(PastePluginWord);
HtmlToUDMService.use(PastePluginLark);

describe('test case in html and udm convert', () => {
    let body: Nullable<IDocumentBody> = null;
    let html: string = '';

    beforeEach(() => {
        body = {
            dataStream: 'helloworld',
            textRuns: [
                {
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 5,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.TRUE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
        };

        html = `<p
  class="MsoNormal"
  align="left"
  style="
    margin: 16.8pt 0cm 0cm;
    text-align: left;
    font-size: 10.5pt;
    font-family: DengXian;
    color: rgb(0, 0, 0);
    font-style: normal;
    font-variant-ligatures: normal;
    font-variant-caps: normal;
    font-weight: 400;
    letter-spacing: normal;
    orphans: 2;
    text-indent: 0px;
    text-transform: none;
    widows: 2;
    word-spacing: 0px;
    -webkit-text-stroke-width: 0px;
    white-space: normal;
    text-decoration-thickness: initial;
    text-decoration-style: initial;
    text-decoration-color: initial;
    background: white;
  "
><span style="font-size: 12pt; font-family: 宋体; color: rgb(18, 18, 18)"
    >hello</span
  ></p>
<span
  style="
    font-style: normal;
    font-variant-ligatures: normal;
    font-variant-caps: normal;
    font-weight: 400;
    letter-spacing: normal;
    orphans: 2;
    text-align: start;
    text-indent: 0px;
    text-transform: none;
    widows: 2;
    word-spacing: 0px;
    -webkit-text-stroke-width: 0px;
    white-space: normal;
    text-decoration-thickness: initial;
    text-decoration-style: initial;
    text-decoration-color: initial;
    font-size: 12pt;
    font-family: 宋体;
    color: rgb(18, 18, 18);
  "
>world</span>`;
    });

    afterEach(() => {
        body = null;
        html = '';
    });

    describe('test cases in html-to-udm', () => {
        it('should paste the case when convert html to udm', async () => {
            const convertor = new HtmlToUDMService();
            const udm = await convertor.convert(html);

            expect(udm.body!.dataStream).toBe('hello\rworld');
        });
    });

    describe('test cases in udm-to-html', () => {
        it('should paste the case when convert udm to html', async () => {
            const convertor = new UDMToHtmlService();
            const html = await convertor.convert([{ body: body!, id: '', documentStyle: {} }]);

            expect(html).toBe('<p class="UniverNormal" ><strong>hello</strong><strong><i>world</i></strong></p>');
        });
    });
});
