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

import { Menu, MenuItem, MenuItemGroup, SubMenu } from './Menu';

export default {
    title: 'Components / Menu',
    component: Menu,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export const Default = () => {
    return (
        <Menu>
            <MenuItemGroup>
                <MenuItem>Item 1</MenuItem>
                <MenuItem>Item 2</MenuItem>
                <MenuItem>Item 3</MenuItem>
            </MenuItemGroup>
            <MenuItemGroup title="Group 1">
                <MenuItem>Item 4</MenuItem>
                <MenuItem>Item 5</MenuItem>
            </MenuItemGroup>
            <MenuItemGroup>
                <SubMenu title="SubMenu">
                    <MenuItemGroup>
                        <MenuItem>Item 6</MenuItem>
                    </MenuItemGroup>
                </SubMenu>
                <SubMenu title="SubMenu2">
                    <MenuItemGroup>
                        <MenuItem>Item 7</MenuItem>
                        <MenuItem>Item 8</MenuItem>
                    </MenuItemGroup>
                </SubMenu>
            </MenuItemGroup>
        </Menu>
    );
};
