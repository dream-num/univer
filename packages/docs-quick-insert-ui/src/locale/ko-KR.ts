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
    docQuickInsert: {
        menu: {
            numberedList: '번호가 매겨진 목록',
            bulletedList: '글머리 기호 목록',
            divider: '구분선',
            text: '텍스트',
            table: '표',
            image: '이미지',
        },
        group: {
            basics: '기본',
        },
        placeholder: '결과가 없습니다',
        keywordInputPlaceholder: '키워드 입력',
    },
};

export default locale;
