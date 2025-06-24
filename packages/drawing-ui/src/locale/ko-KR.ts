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
    'image-popup': {
        replace: '교체',
        delete: '삭제',
        edit: '편집',
        crop: '자르기',
        reset: '크기 초기화',
    },
    'image-cropper': {
        error: '이미지가 아닌 객체는 자를 수 없습니다.',
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
            reGroup: '다시 그룹화',
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
    'drawing-view': '그리기',
    shortcut: {
        'drawing-move-down': '그리기 아래로 이동',
        'drawing-move-up': '그리기 위로 이동',
        'drawing-move-left': '그리기 왼쪽으로 이동',
        'drawing-move-right': '그리기 오른쪽으로 이동',
        'drawing-delete': '그리기 삭제',
    },
};

export default locale;
