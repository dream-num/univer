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
import emojiLocale from './emoji-locale/ko-KR.generated';

const locale: typeof enUS = {
    ui: {
        objectPermission: {
            operationDenied: '이 콘텐츠는 보호되어 있어 작업을 수행할 수 없습니다.',
            remove: '보호 삭제',
            roleOwner: '파일 소유자',
            roleEditor: '파일 편집자',
            selectedCount: '선택됨: {0}',
            searchPeople: '사용자 검색',
            noMatchingPeople: '일치하는 사용자가 없습니다',
            loadMore: '더 불러오기',
            fileHint: '파일 공유 설정에서 구성원을 관리합니다. 이 설정은 해당 구성원의 작업을 제한합니다.',
            documentParent: '이 섹션에는 문서 편집 제한도 적용됩니다.',
            paragraphParent: '이 단락에는 문서와 상위 섹션의 편집 제한도 적용됩니다.',
            documentObjectParent: '문서와 이 개체를 포함하거나 고정하는 섹션 및 단락의 편집 제한도 적용될 수 있습니다.',
            slideParent: '프레젠테이션 편집 제한도 적용됩니다.',
            slideObjectParent: '프레젠테이션과 상위 슬라이드 또는 마스터의 편집 제한도 적용됩니다.',
            baseParent: 'Base 편집 제한도 적용됩니다.',
            baseObjectParent: 'Base와 상위 테이블의 편집 제한도 적용됩니다.',
            recordParent: 'Base와 테이블 제한도 적용됩니다. 값을 편집하려면 해당 필드의 권한도 필요합니다.',
            boardParent: '이 개체에는 보드 편집 제한도 적용됩니다.',
            ownerInherit: '파일 소유자, 상속된 액세스 권한',
            peopleError: '사용자를 불러올 수 없습니다. 다시 시도하세요.',
            document: '문서',
            section: '섹션',
            paragraph: '단락',
            entity: '개체',
            presentation: '프레젠테이션',
            page: '슬라이드',
            master: '마스터 보기',
            base: 'Base',
            table: '테이블',
            field: '필드',
            record: '레코드',
            view: '보기',
            board: '보드',
            objectName: '{0}: {1}',

            search: '개체 검색',
            empty: '일치하는 개체가 없습니다',
            more: '처음 100개 개체를 표시합니다. 검색하여 목록을 좁히세요.',
            title: '권한',
            cancel: '취소',
            save: '저장',
            saving: '저장 중…',
            loading: '불러오는 중…',
            conflict: '권한이 변경되었습니다. 저장하기 전에 새로고침하세요.',
            error: '권한을 불러오거나 저장할 수 없습니다. 변경 사항은 유지됩니다.',
            reload: '새로고침',
            denied: '이 개체의 권한을 관리할 수 없습니다.',
            edit: '편집할 수 있는 사용자',
            all: '모든 파일 편집자',
            owner: '개체 소유자만',
            members: '선택한 구성원',
            copy: '편집자의 복사 허용',
            print: '편집자의 인쇄 허용',
            export: '편집자의 내보내기 허용',
            comment: '편집자의 댓글 허용',
            parentHint: '파일 및 상위 개체의 제한도 적용됩니다.',
        },
        featureSearch: {
            title: '기능 검색',
            placeholder: '기능 또는 메뉴 이름 입력...',
            empty: '사용 가능한 기능을 찾을 수 없습니다',
            ribbon: '리본',
            contextMenu: '상황에 맞는 메뉴',
        },
        emojiPicker: {
            search: '검색',
            random: '무작위 이모지',
            recents: '최근 항목',
            emojis: '이모지',
            animals: '동물',
            food: '음식',
            activities: '활동',
            places: '장소',
            objects: '사물',
            symbols: '기호',
            searchResults: '검색 결과',
            noResults: '이모지를 찾을 수 없음',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: '수학',
            greek: '그리스 문자',
            common: '일반',
        },
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
            'not-supported': '시스템에 해당 폰트가 없어 기본 폰트를 사용합니다.',
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
        navigation: {
            back: '뒤로',
            previous: '이전',
            next: '다음',
        },
        sidebar: {
            panel: '사이드바 패널',
            resize: '사이드바 크기 조정',
            close: '사이드바 닫기',
        },
        beforeClose: {
            title: '일부 변경 사항이 저장되지 않았습니다',
        },
        clipboard: {
            authentication: {
                title: '권한 거절',
                content: 'Univer에 클립보드 접근 권한을 부여해주세요.',
            },
        },
        rangeSelector: {
            cancel: '취소',
        },
        'global-shortcut': '전역 단축키',
        row: '행',
        column: '열',
    },
};

export default locale;
