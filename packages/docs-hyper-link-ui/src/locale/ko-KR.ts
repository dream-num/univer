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
    docLink: {
        edit: {
            confirm: '확인',
            cancel: '취소',
            title: '링크',
            address: '링크',
            placeholder: '링크 URL을 입력해주세요',
            addressError: 'URL이 올바르지 않습니다!',
            label: '라벨',
            labelError: '링크 라벨을 입력해주세요',
        },
        info: {
            copy: '복사',
            edit: '편집',
            cancel: '링크 취소',
            coped: '링크가 클립보드에 복사되었습니다',
        },
        menu: {
            tooltip: '링크 추가',
        },
    },
};

export default locale;
