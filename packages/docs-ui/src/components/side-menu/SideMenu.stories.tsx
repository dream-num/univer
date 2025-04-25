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

import type { Meta } from '@storybook/react';
import type { ISideMenuItem } from './index';
import { useState } from 'react';
import { SideMenu } from './index';

const meta: Meta<typeof SideMenu> = {
    title: 'Components / SideMenu',
    component: SideMenu,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const SideMenuBasic = {
    render() {
        const [open, setOpen] = useState(false);
        const menus: ISideMenuItem[] = [
            { text: 'Section 1', level: 1, id: 'section1' },
            { text: 'Item 1.1', level: 2, id: 'item1.1' },
            { text: 'Item 1.2', level: 2, id: 'item1.2' },
            { text: 'Section 2', level: 1, id: 'section2' },
            { text: 'Item 2.1', level: 2, id: 'item2.1' },
            { text: 'Item 2.2', level: 2, id: 'item2.2' },
        ];

        const handleClick = (_menu: ISideMenuItem) => {
        };

        return (
            <SideMenu
                maxHeight={150}
                menus={menus}
                onClick={handleClick}
                open={open}
                onOpenChange={setOpen}
                mode="side-bar"
            />
        );
    },
};

export const EmptySideMenu = {
    render() {
        return <SideMenu maxHeight={150} />;
    },
};

export const CustomStyledSideMenu = {
    render() {
        const menus: ISideMenuItem[] = [
            { text: 'Section 1', level: 1, id: 'section1' },
            { text: 'Item 1.1', level: 2, id: 'item1.1' },
            { text: 'Item 1.2', level: 2, id: 'item1.2' },
        ];

        const customStyle = {
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
        };

        return <SideMenu maxHeight={150} menus={menus} className="custom-side-menu" style={customStyle} />;
    },
};

export const MultiLevelSideMenu = {
    render() {
        const menus: ISideMenuItem[] = [
            { text: 'Section 1', level: 1, id: 'section1' },
            { text: 'Item 1.1', level: 2, id: 'item1.1' },
            { text: 'Subitem 1.1.1', level: 3, id: 'subitem1.1.1' },
            { text: 'Subitem 1.1.2', level: 3, id: 'subitem1.1.2' },
            { text: 'Item 1.2', level: 2, id: 'item1.2' },
            { text: 'Section 2', level: 1, id: 'section2' },
            { text: 'Item 2.1', level: 2, id: 'item2.1' },
        ];

        const handleClick = (_menu: ISideMenuItem) => {
        };

        return <SideMenu maxHeight={150} menus={menus} onClick={handleClick} />;
    },
};
