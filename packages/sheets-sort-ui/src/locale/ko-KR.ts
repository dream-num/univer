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
    'sheets-sort': {
        general: {
            sort: '정렬',
            'sort-asc': '오름차순',
            'sort-desc': '내림차순',
            'sort-custom': '사용자 정의 순서',
            'sort-asc-ext': '오름차순 확장',
            'sort-desc-ext': '내림차순 확장',
            'sort-asc-cur': '오름차순',
            'sort-desc-cur': '내림차순',
        },
        error: {
            'merge-size': '선택한 범위에 서로 다른 크기의 병합 셀이 있어 정렬할 수 없습니다.',
            empty: '선택한 범위에 내용이 없어 정렬할 수 없습니다.',
            single: '선택한 범위에 한 행만 있어 정렬할 수 없습니다.',
            'formula-array': '선택한 범위에 배열 수식이 있어 정렬할 수 없습니다.',
        },
        dialog: {
            'sort-reminder': '정렬 알림',
            'sort-reminder-desc': '범위 정렬 확장 또는 범위 정렬 유지?',
            'sort-reminder-ext': '범위 정렬 확장',
            'sort-reminder-no': '범위 정렬 유지',
            'first-row-check': '첫 번째 행은 정렬에 참여하지 않습니다',
            'add-condition': '조건 추가',
            cancel: '취소',
            confirm: '확인',
        },
    },
};

export default locale;
