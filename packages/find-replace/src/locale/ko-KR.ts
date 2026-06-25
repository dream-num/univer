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
            'open-find-dialog': '찾기 대화 상자 열기',
            'open-replace-dialog': '바꾸기 대화 상자 열기',
            'close-dialog': '찾기 및 바꾸기 대화 상자 닫기',
            'go-to-next-match': '다음 일치 항목으로 이동',
            'go-to-previous-match': '이전 일치 항목으로 이동',
            'focus-selection': '선택 영역에 포커스',
            panel: '찾기 및 바꾸기',
        },
        dialog: {
            title: '찾기',
            find: '찾기',
            replace: '바꾸기',
            'replace-all': '모두 바꾸기',
            'case-sensitive': '대/소문자 구분',
            'find-placeholder': '이 시트에서 찾기',
            'advanced-finding': '고급 검색 및 바꾸기',
            'replace-placeholder': '바꿀 문자열 입력',
            'match-the-whole-cell': '전체 셀 내용 일치',
            'find-direction': {
                title: '검색 방향',
                row: '행 기준 검색',
                column: '열 기준 검색',
            },
            'find-scope': {
                title: '검색 범위',
                'current-sheet': '현재 시트',
                workbook: '통합 문서',
            },
            'find-by': {
                title: '검색 기준',
                value: '값으로 찾기',
                formula: '수식 찾기',
            },
            'no-match': '검색이 완료되었으나 일치 항목을 찾을 수 없습니다.',
            'no-result': '결과 없음',
        },
        replace: {
            'all-success': '일치 항목 {0}개를 모두 바꿨습니다.',
            'partial-success': '일치 항목 {0}개를 바꾸고 {1}개는 바꾸지 못했습니다.',
            'all-failure': '바꾸기 실패',
            confirm: {
                title: '모든 일치 항목을 바꾸시겠습니까?',
            },
        },
        button: {
            confirm: '확인',
            cancel: '취소',
        },
    },
};

export default locale;
