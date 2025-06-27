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
        heading: {
            normal: '일반',
            title: '제목',
            subTitle: '부제목',
            1: '제목 1',
            2: '제목 2',
            3: '제목 3',
            4: '제목 4',
            5: '제목 5',
            6: '제목 6',
            tooltip: '제목 설정',
        },
    },
    ribbon: {
        start: '시작',
        startDesc: '워크시트를 초기화하고 기본 매개변수를 설정합니다.',
        insert: '삽입',
        insertDesc: '행, 열, 차트 및 다양한 요소를 삽입합니다.',
        formulas: '수식',
        formulasDesc: '데이터 계산을 위한 함수와 수식을 사용합니다.',
        data: '데이터',
        dataDesc: '데이터를 관리하며, 가져오기, 정렬 및 필터링을 포함합니다.',
        view: '보기',
        viewDesc: '보기 모드를 전환하고 표시 효과를 조정합니다.',
        others: '기타',
        othersDesc: '기타 함수와 설정.',
        more: '더 보기',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: 'Microsoft YaHei',
        SimSun: 'SimSun',
        SimHei: 'SimHei',
        Kaiti: 'Kaiti',
        FangSong: 'FangSong',
        NSimSun: 'NSimSun',
        STXinwei: 'STXinwei',
        STXingkai: 'STXingkai',
        STLiti: 'STLiti',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: '단축키',
    },
    shortcut: {
        undo: '실행 취소',
        redo: '다시 실행',
        cut: '자르기',
        copy: '복사',
        paste: '붙여넣기',
        'shortcut-panel': '단축키 패널 전환',
    },
    'common-edit': '일반 편집 단축키',
    'toggle-shortcut-panel': '단축키 패널 전환',
    clipboard: {
        authentication: {
            title: '권한 거절',
            content: 'Univer에 클립보드 접근 권한을 부여해주세요.',
        },
    },
    textEditor: {
        formulaError: '올바른 수식을 입력하세요, 예: =SUM(A1)',
        rangeError: '올바른 범위를 입력하세요, 예: A1:B10',
    },
    rangeSelector: {
        title: '데이터 범위 선택',
        addAnotherRange: '범위 추가',
        buttonTooltip: '데이터 범위 선택',
        placeHolder: '범위를 선택하거나 입력하세요.',
        confirm: '확인',
        cancel: '취소',
    },
    'global-shortcut': '전역 단축키',
    'zoom-slider': {
        resetTo: '초기화',
    },
};

export default locale;
