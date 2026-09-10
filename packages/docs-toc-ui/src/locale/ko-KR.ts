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
    'docs-toc-ui': {
        tableOfContents: {
            title: '목차',
            insertTitle: '목차',
            automaticTitle: '자동 목차',
            customTitle: '사용자 지정 목차…',
            contentsTitle: '목차',
            levels: '표시할 수준',
            showPageNumbers: '페이지 번호 표시',
            rightAlignPageNumbers: '페이지 번호 오른쪽 맞춤',
            tabLeader: '탭 채움선',
            leaderNone: '없음',
            leaderDots: '점선',
            leaderDashes: '파선',
            leaderUnderline: '밑줄',
            format: '서식',
            formatFromTemplate: '서식 파일에서',
            formatClassic: '클래식',
            formatModern: '모던',
            formatSimple: '간단',
            preview: '인쇄 미리 보기',
            previewHeading: '제목',
            noHeadings: '제목을 찾을 수 없습니다. 제목 1–3 스타일을 적용하거나 해당 수준을 선택하세요.',
            updateTitle: '목차 업데이트',
            removeTitle: '목차 제거',
            updatePageNumbersOnly: '페이지 번호만 업데이트',
            updateEntireTable: '목차 전체 업데이트',
            updateHint: '이 목차를 업데이트할 방법을 선택하세요.',
        },
    },
};

export default locale;
