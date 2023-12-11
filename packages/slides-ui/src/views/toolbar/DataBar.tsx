/**
 * Copyright 2023 DreamNum Inc.
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

import React from 'react';

interface BarProps {
    list: Array<Record<string, string>>;
    img: string;
    onClick?: (item: {}, index: number) => void;
}

export const DataBar = (props: BarProps) => {
    const { list, img, onClick } = props;
    const background = `url(${img}) no-repeat`;

    const handleClick = (item: {}, index: number) => {
        onClick?.call(this, item, index);
    };

    return (
        <div style={{ display: 'flex' }}>
            {list.map((item, index) => (
                <div
                    key={index}
                    onClick={() => handleClick(item, index)}
                    style={{ width: '28px', height: '26px', background, backgroundPosition: `${item.x} ${item.y}` }}
                />
            ))}
        </div>
    );
};
