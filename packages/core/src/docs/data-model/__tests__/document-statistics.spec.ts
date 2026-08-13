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

import { describe, expect, it } from 'vitest';
import { LocaleType } from '../../../types/enum/locale-type';
import { DocumentDataModel } from '../document-data-model';

describe('DocumentDataModel.getStatistics', () => {
    const model = new DocumentDataModel({ body: { dataStream: '你好，世界！\rHello world 123.\rOne\tTwo  three\r\n' } });

    it('calculates mixed-language document statistics asynchronously', async () => {
        await expect(model.getStatistics({ locale: LocaleType.ZH_CN })).resolves.toEqual({
            words: 12,
            charactersWithoutSpaces: 31,
            charactersWithSpaces: 36,
            paragraphs: 3,
            nonAsianWords: 6,
            asianCharactersAndKoreanWords: 6,
        });
    });

    it('merges overlapping selections before calculating statistics', async () => {
        await expect(model.getStatistics({
            locale: LocaleType.EN_US,
            ranges: [
                { startOffset: 9, endOffset: 20, collapsed: false },
                { startOffset: 15, endOffset: 20, collapsed: false },
            ],
        })).resolves.toEqual({
            words: 3,
            charactersWithoutSpaces: 9,
            charactersWithSpaces: 11,
            paragraphs: 0,
            nonAsianWords: 3,
            asianCharactersAndKoreanWords: 0,
        });
    });

    it('stops obsolete calculations', async () => {
        const controller = new AbortController();
        controller.abort();

        await expect(model.getStatistics({ signal: controller.signal })).rejects.toThrow();
    });
});
