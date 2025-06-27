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
    docImage: {
        title: '이미지',

        upload: {
            float: '이미지 삽입',
        },

        panel: {
            title: '이미지 편집',
        },
    },
    'image-popup': {
        replace: '교체',
        delete: '삭제',
        edit: '편집',
        crop: '자르기',
        reset: '크기 초기화',
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
    'image-position': {
        title: '위치',
        horizontal: '수평',
        vertical: '수직',
        absolutePosition: '절대 위치(px)',
        relativePosition: '상대 위치',
        toTheRightOf: '우측에',
        relativeTo: '상대적으로',
        bellow: '아래에',
        options: '옵션',
        moveObjectWithText: '텍스트와 함께 객체 이동',
        column: '열',
        margin: '여백',
        page: '페이지',
        line: '줄',
        paragraph: '문단',
    },
    'update-status': {
        exceedMaxSize: '이미지 크기가 제한을 초과했습니다. 제한: {0}MB',
        invalidImageType: '유효하지 않은 이미지 유형입니다',
        exceedMaxCount: '한 번에 최대 {0}개만 업로드할 수 있습니다',
        invalidImage: '유효하지 않은 이미지입니다',
    },
};

export default locale;
