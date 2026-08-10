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

import { ListGlyphType, PRESET_LIST_TYPE, PresetListType } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';

export interface IListTypePickerBaseProps {
    value?: PresetListType;
    onChange: (value: PresetListType | undefined) => void;
}

interface IListTypePickerProps extends IListTypePickerBaseProps {
    options: PresetListType[];
}

export const ListTypePicker = (props: IListTypePickerProps) => {
    const { value, onChange, options } = props;
    const previewRows = [
        { id: 'level-0-top', levelIndex: 0 },
        { id: 'level-1', levelIndex: 1 },
        { id: 'level-2', levelIndex: 2 },
        { id: 'level-0-bottom', levelIndex: 0 },
    ];
    const previewIndentClassNames = ['', 'univer-pl-2', 'univer-pl-4'];

    const getOrderedGlyph = (glyphType?: ListGlyphType | string) => {
        switch (glyphType) {
            case ListGlyphType.DECIMAL_ZERO:
                return '01';
            case ListGlyphType.UPPER_LETTER:
                return 'A';
            case ListGlyphType.LOWER_LETTER:
                return 'a';
            case ListGlyphType.UPPER_ROMAN:
                return 'I';
            case ListGlyphType.LOWER_ROMAN:
                return 'i';
            default:
                return '1';
        }
    };

    const getMarker = (listType: PresetListType, levelIndex: number) => {
        const levels = PRESET_LIST_TYPE[listType].nestingLevel;
        const level = levels[levelIndex];
        if (level.glyphSymbol) {
            return level.glyphSymbol;
        }

        return level.glyphFormat?.replace(/%(\d+)/g, (_match, index: string) => (
            getOrderedGlyph(levels[Number(index) - 1]?.glyphType)
        )) ?? '1.';
    };

    return (
        <div
            className="univer-grid univer-grid-cols-3 univer-gap-2 univer-p-1.5"
            data-u-editor-interaction-boundary="true"
        >
            {options.map((item) => (
                <a
                    key={item}
                    className={clsx(`
                      univer-block univer-h-20 univer-w-[72px] univer-cursor-pointer univer-overflow-hidden
                      univer-rounded univer-transition-all
                      hover:univer-border-primary-500
                    `, borderClassName, {
                        'univer-border-primary-500': value === item,
                    })}
                    onClick={() => onChange(item)}
                >
                    <div
                        className="
                          univer-box-border univer-grid univer-size-full univer-grid-rows-4 univer-gap-1
                          univer-bg-gray-50 univer-p-2 univer-text-gray-900
                        "
                        data-u-comp="list-type-preview"
                    >
                        {previewRows.map(({ id, levelIndex }) => (
                            <div
                                key={id}
                                className={clsx('univer-flex univer-items-center univer-gap-1', previewIndentClassNames[levelIndex])}
                            >
                                <span
                                    className="
                                      univer-w-3 univer-shrink-0 univer-overflow-hidden univer-text-center
                                      univer-text-[10px] univer-leading-none
                                    "
                                >
                                    {getMarker(item, levelIndex)}
                                </span>
                                <span className="univer-h-1 univer-flex-1 univer-rounded univer-bg-gray-200" />
                            </div>
                        ))}
                    </div>
                </a>
            ))}
        </div>
    );
};

const orderListOptions = [
    PresetListType.ORDER_LIST,
    PresetListType.ORDER_LIST_1,
    PresetListType.ORDER_LIST_2,
    PresetListType.ORDER_LIST_3,
    PresetListType.ORDER_LIST_4,
    PresetListType.ORDER_LIST_5,
];

export const OrderListTypePicker = (props: IListTypePickerBaseProps) => (
    <ListTypePicker {...props} options={orderListOptions} />
);

const bulletOptions = [
    PresetListType.BULLET_LIST,
    PresetListType.BULLET_LIST_1,
    PresetListType.BULLET_LIST_2,
    PresetListType.BULLET_LIST_3,
    PresetListType.BULLET_LIST_4,
    PresetListType.BULLET_LIST_5,
];

export const BulletListTypePicker = (props: IListTypePickerBaseProps) => (
    <ListTypePicker {...props} options={bulletOptions} />
);
