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
    'drawing-ui': {
        'image-cropper': {
            error: '이미지가 아닌 객체는 자를 수 없습니다.',
        },
        objectListPanel: {
            title: '개체',
            empty: '개체 없음',
            showAll: '모두 표시',
            hideAll: '모두 숨기기',
            moveForward: '앞으로 가져오기',
            moveBackward: '뒤로 보내기',
            close: '닫기',
            show: '표시',
            hide: '숨기기',
            lock: '잠금',
            unlock: '잠금 해제',
            name: '이름',
            nameInput: '개체 이름',
            description: '설명',
            descriptionPlaceholder: '설명 추가',
            details: '세부 정보',
            locate: '위치 찾기',
            expand: '펼치기',
            collapse: '접기',
            dragToReorder: '드래그하여 순서 변경',
            search: '개체 검색',
            filterAll: '전체',
            filterHidden: '숨김',
            filterLocked: '잠김',
            sectionCanvas: '캔버스 레이어',
            sectionFloating: '플로팅 레이어',
            typeNames: {
                object: '개체',
                shape: '도형',
                connector: '연결선',
                image: '이미지',
                chart: '차트',
                table: '표',
                smartArt: 'SmartArt',
                video: '비디오',
                group: '그룹',
                unit: '단위',
                dom: 'DOM',
                text: '텍스트',
                placeholder: '자리 표시자',
                container: '컨테이너',
            },
            noSelection: '세부 정보를 편집할 개체를 선택하세요',
        },
        'image-panel': {
            arrange: {
                title: '정렬',
                forward: '앞으로 가져오기',
                backward: '뒤로 보내기',
                front: '맨 앞으로 가져오기',
                back: '맨 뒤로 보내기',
            },
            transform: {
                title: '변형',
                rotate: '회전 (°)',
                x: 'X 좌표 (px)',
                y: 'Y 좌표 (px)',
                width: '너비 (px)',
                height: '높이 (px)',
                lock: '비율 고정 (%)',
            },
            crop: {
                title: '자르기',
                start: '자르기 시작',
                mode: '자유 모드',
            },
            group: {
                title: '그룹',
                group: '그룹화',
                unGroup: '그룹 해제',
            },
            align: {
                title: '맞춤',
                default: '맞춤 유형 선택',
                left: '왼쪽 맞춤',
                center: '가운데 맞춤',
                right: '오른쪽 맞춤',
                top: '위쪽 맞춤',
                middle: '가운데 맞춤',
                bottom: '아래쪽 맞춤',
                horizon: '수평 간격 균등 분배',
                vertical: '수직 간격 균등 분배',
            },
            null: '선택된 객체가 없습니다',
        },
        'image-text-wrap': {
            title: '텍스트 감싸기',
            wrappingStyle: '감싸기 스타일',
            square: '사각형',
            topAndBottom: '위아래',
            inline: '텍스트와 같은 줄',
            behindText: '텍스트 뒤',
            inFrontText: '텍스트 앞',
            wrapText: '텍스트 감싸기',
            bothSide: '양쪽',
            leftOnly: '왼쪽만',
            rightOnly: '오른쪽만',
            distanceFromText: '텍스트와 거리',
            top: '위(px)',
            left: '왼쪽(px)',
            bottom: '아래(px)',
            right: '오른쪽(px)',
        },
        'image-popup': {
            replace: '교체',
            delete: '삭제',
            edit: '편집',
            crop: '자르기',
            reset: '크기 초기화',
        },
    },
};

export default locale;
