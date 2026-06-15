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

import type { IconType, IIconProps } from '@univerjs/ui';

type ColorSwatchIconProps = IIconProps & {
    color: string;
};

export function TitleTypeIcon({ className, style, onClick }: IIconProps) {
    return (
        <svg
            className={className}
            style={style}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            onClick={onClick}
        >
            <text
                x={2}
                y={19}
                fontFamily="Arial, sans-serif"
                fontSize={19}
                fontWeight={500}
            >
                T
            </text>
            <text
                x={15}
                y={19}
                fontFamily="Arial, sans-serif"
                fontSize={13}
                fontWeight={500}
            >
                t
            </text>
        </svg>
    );
}

export function SubtitleTypeIcon({ className, style, onClick }: IIconProps) {
    return (
        <svg
            className={className}
            style={style}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            onClick={onClick}
        >
            <text
                x={5}
                y={19}
                fontFamily="Arial, sans-serif"
                fontSize={19}
                fontWeight={500}
            >
                S
            </text>
        </svg>
    );
}

export function TextColorSwatchIcon({ className, style, onClick, color }: ColorSwatchIconProps) {
    return (
        <svg
            className={className}
            style={style}
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            aria-hidden="true"
            onClick={onClick}
        >
            <rect
                x={3}
                y={3}
                width={18}
                height={18}
                rx={4}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.16}
            />
            <text
                x={7.5}
                y={16.5}
                fontFamily="Arial, sans-serif"
                fontSize={12}
                fontWeight={700}
                fill={color}
            >
                A
            </text>
        </svg>
    );
}

export function BackgroundColorSwatchIcon({ className, style, onClick, color }: ColorSwatchIconProps) {
    return (
        <svg
            className={className}
            style={style}
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            aria-hidden="true"
            onClick={onClick}
        >
            <rect
                x={3}
                y={3}
                width={18}
                height={18}
                rx={5}
                fill={color}
                stroke="currentColor"
                strokeOpacity={0.12}
            />
        </svg>
    );
}

export function HeaderTextColorIcon({ className, style, onClick, extend }: IIconProps) {
    const color = extend?.colorChannel1 ?? 'currentColor';

    return (
        <TextColorSwatchIcon
            className={className}
            style={style}
            onClick={onClick}
            color={color}
        />
    );
}

export function DefaultTextColorIcon({ className, style, onClick }: IIconProps) {
    return (
        <TextColorSwatchIcon
            className={className}
            style={style}
            onClick={onClick}
            color="#000000"
        />
    );
}

function createTextColorSwatchIcon(color: string): IconType {
    return function DocParagraphTextColorSwatchIcon(props: IIconProps) {
        return <TextColorSwatchIcon {...props} color={color} />;
    };
}

function createBackgroundColorSwatchIcon(color: string): IconType {
    return function DocParagraphBackgroundColorSwatchIcon(props: IIconProps) {
        return <BackgroundColorSwatchIcon {...props} color={color} />;
    };
}

export const DocParagraphTextColorSwatchIcon0 = createTextColorSwatchIcon('#FE4B4B');
export const DocParagraphTextColorSwatchIcon1 = createTextColorSwatchIcon('#FF8C51');
export const DocParagraphTextColorSwatchIcon2 = createTextColorSwatchIcon('#A4DC16');
export const DocParagraphTextColorSwatchIcon3 = createTextColorSwatchIcon('#2DAEFF');
export const DocParagraphTextColorSwatchIcon4 = createTextColorSwatchIcon('#3A60F7');
export const DocParagraphTextColorSwatchIcon5 = createTextColorSwatchIcon('#9E6DE3');
export const DocParagraphTextColorSwatchIcon6 = createTextColorSwatchIcon('#F248A6');

export const DocParagraphBackgroundColorSwatchIcon0 = createBackgroundColorSwatchIcon('rgba(158, 109, 227, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon1 = createBackgroundColorSwatchIcon('rgba(254, 75, 75, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon2 = createBackgroundColorSwatchIcon('rgba(255, 140, 81, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon3 = createBackgroundColorSwatchIcon('rgba(164, 220, 22, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon4 = createBackgroundColorSwatchIcon('rgba(45, 174, 255, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon5 = createBackgroundColorSwatchIcon('rgba(58, 96, 247, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon6 = createBackgroundColorSwatchIcon('rgba(242, 72, 166, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon7 = createBackgroundColorSwatchIcon('rgba(153, 153, 153, 0.3)');
export const DocParagraphBackgroundColorSwatchIcon8 = createBackgroundColorSwatchIcon('rgba(158, 109, 227, 0.15)');
export const DocParagraphBackgroundColorSwatchIcon9 = createBackgroundColorSwatchIcon('rgba(254, 75, 75, 0.15)');
export const DocParagraphBackgroundColorSwatchIcon10 = createBackgroundColorSwatchIcon('rgba(255, 140, 81, 0.15)');
export const DocParagraphBackgroundColorSwatchIcon11 = createBackgroundColorSwatchIcon('rgba(164, 220, 22, 0.15)');
export const DocParagraphBackgroundColorSwatchIcon12 = createBackgroundColorSwatchIcon('rgba(45, 174, 255, 0.15)');
export const DocParagraphBackgroundColorSwatchIcon13 = createBackgroundColorSwatchIcon('rgba(58, 96, 247, 0.15)');
export const DocParagraphBackgroundColorSwatchIcon14 = createBackgroundColorSwatchIcon('rgba(242, 72, 166, 0.15)');
