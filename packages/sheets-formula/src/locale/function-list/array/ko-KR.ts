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

import type enUS from './en-US';

const locale: typeof enUS = {
    ARRAY_CONSTRAIN: {
        description: '배열 결과를 지정된 크기로 제한합니다.',
        abstract: '배열 결과를 지정된 크기로 제한합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/3267036?hl=ko',
            },
        ],
        functionParameter: {
            inputRange: { name: 'input_range', detail: '제한할 범위입니다.' },
            numRows: { name: 'num_rows', detail: '결과에 포함할 행의 수입니다.' },
            numCols: { name: 'num_cols', detail: '결과에 포함할 열의 수입니다.' },
        },
    },
    FLATTEN: {
        description: '하나 이상의 범위에서 모든 값을 하나의 열로 평면화합니다.',
        abstract: '하나 이상의 범위에서 모든 값을 하나의 열로 평면화합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.google.com/docs/answer/10307761?hl=ko',
            },
        ],
        functionParameter: {
            range1: { name: 'range1', detail: '첫 번째로 평면화할 범위입니다.' },
            range2: { name: 'range2', detail: '추가로 평면화할 범위입니다.' },
        },
    },
};

export default locale;
