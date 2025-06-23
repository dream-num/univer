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
    toolbar: {
        undo: '실행 취소',
        redo: '다시 실행',
        font: '글꼴',
        fontSize: '글꼴 크기',
        bold: '굵게',
        italic: '기울임꼴',
        strikethrough: '취소선',
        subscript: '아래 첨자',
        superscript: '위 첨자',
        underline: '밑줄',
        textColor: {
            main: '글자 색상',
            right: '색상 선택',
        },
        fillColor: {
            main: '글자 배경색',
            right: '색상 선택',
        },
        table: {
            main: '표',
            insert: '표 삽입',
            colCount: '열 개수',
            rowCount: '행 개수',
        },
        resetColor: '기본색으로 재설정',
        order: '번호 매기기',
        unorder: '글머리 기호',
        checklist: '할 일 목록',
        documentFlavor: '모던 모드',
        alignLeft: '왼쪽 정렬',
        alignCenter: '가운데 정렬',
        alignRight: '오른쪽 정렬',
        alignJustify: '양쪽 맞춤',
        horizontalLine: '가로줄 삽입',
        headerFooter: '머리글 및 바닥글',
        pageSetup: '페이지 설정',
    },
    table: {
        insert: '삽입',
        insertRowAbove: '위에 행 삽입',
        insertRowBelow: '아래에 행 삽입',
        insertColumnLeft: '왼쪽에 열 삽입',
        insertColumnRight: '오른쪽에 열 삽입',
        delete: '표 삭제',
        deleteRows: '행 삭제',
        deleteColumns: '열 삭제',
        deleteTable: '표 삭제',
    },
    headerFooter: {
        header: '머리글',
        footer: '바닥글',
        panel: '머리글 및 바닥글 설정',
        firstPageCheckBox: '첫 페이지 다르게 설정',
        oddEvenCheckBox: '홀짝 페이지 다르게 설정',
        headerTopMargin: '머리글 위쪽 여백(px)',
        footerBottomMargin: '바닥글 아래쪽 여백(px)',
        closeHeaderFooter: '머리글 및 바닥글 닫기',
        disableText: '머리글 및 바닥글 설정이 비활성화되었습니다',
    },
    doc: {
        menu: {
            paragraphSetting: '문단 설정',
        },
        slider: {
            paragraphSetting: '문단 설정',
        },
        paragraphSetting: {
            alignment: '정렬',
            indentation: '들여쓰기',
            left: '왼쪽',
            right: '오른쪽',
            firstLine: '첫 줄',
            hanging: '내어쓰기',
            spacing: '간격',
            before: '위 간격',
            after: '아래 간격',
            lineSpace: '줄 간격',
            multiSpace: '복수 줄 간격',
            fixedValue: '고정 값(px)',
        },
    },
    rightClick: {
        copy: '복사',
        cut: '잘라내기',
        paste: '붙여넣기',
        delete: '삭제',
        bulletList: '글머리 기호 목록',
        orderList: '번호 매기기 목록',
        checkList: '할 일 목록',
        insertBellow: '아래에 삽입',
    },
    'page-settings': {
        'document-setting': '문서 설정',
        'paper-size': '용지 크기',
        'page-size': {
            main: '용지 크기',
            a4: 'A4',
            a3: 'A3',
            a5: 'A5',
            b4: 'B4',
            b5: 'B5',
            letter: 'Letter',
            legal: 'Legal',
            tabloid: 'Tabloid',
            statement: 'Statement',
            executive: 'Executive',
            folio: 'Folio',
        },
        orientation: '방향',
        portrait: '세로',
        landscape: '가로',
        'custom-paper-size': '사용자 정의 용지 크기',
        top: '위',
        bottom: '아래',
        left: '왼쪽',
        right: '오른쪽',
        cancel: '취소',
        confirm: '확인',
    },
};

export default locale;
