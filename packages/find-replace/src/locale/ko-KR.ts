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
    'find-replace': {
        toolbar: '찾기 및 바꾸기',
        shortcut: {
            'open-find-dialog': '찾기 창 열기',
            'open-replace-dialog': '바꾸기 창 열기',
            'close-dialog': '찾기 및 바꾸기 창 닫기',
            'go-to-next-match': '다음 결과로 이동',
            'go-to-previous-match': '이전 결과로 이동',
            'focus-selection': '선택 영역으로 이동',
        },
        dialog: {
            title: '찾기',
            find: '찾기',
            replace: '바꾸기',
            'replace-all': '모두 바꾸기',
            'case-sensitive': '대소문자 구분',
            'find-placeholder': '이 시트에서 찾기',
            'advanced-finding': '고급 검색 및 바꾸기',
            'replace-placeholder': '바꿀 문자열 입력',
            'match-the-whole-cell': '셀 전체 일치',
            'find-direction': {
                title: '검색 방향',
                row: '행 단위 검색',
                column: '열 단위 검색',
            },
            'find-scope': {
                title: '검색 범위',
                'current-sheet': '현재 시트',
                workbook: '통합 문서 전체',
            },
            'find-by': {
                title: '찾기 대상',
                value: '값으로 찾기',
                formula: '수식으로 찾기',
            },
            'no-match': '검색을 완료했으나 일치하는 항목이 없습니다.',
            'no-result': '검색 결과 없음',
        },
        replace: {
            'all-success': '총 {0}건 모두 바꾸기 완료',
            'all-failure': '바꾸기 실패',
            confirm: {
                title: '모든 일치 항목을 바꾸시겠습니까?',
            },
        },
    },
    'find-replace-shortcuts': '찾기 및 바꾸기',
};

export default locale;
