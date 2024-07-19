/**
 * Copyright 2023-present DreamNum Inc.
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
import { NavLink } from 'react-router-dom';
import { DetailsSingle, FolderFillSingle, FolderSingle, HomeFillSingle, HomeSingle, PermissionSettingSingle, TrashFillSingle, TrashSingle } from '@univerjs/icons';
import { TreeMenu } from './tree-menu/TreeMenu';
import styles from './index.module.less';

export const Sidebar: React.FC = () => {
    const treeData = [
        {
            name: 'R&D',
            children: [
                { name: 'Sales Performance', path: '/' },
                { name: 'Competitor Analysis', path: '/' },
                {
                    name: 'User Feedback',
                    children: [
                        { name: 'Survey Results', path: '/' },
                        { name: 'Interviews', path: '/' },
                    ],
                },
                { name: 'Customer Outreach', path: '/' },
            ],
        },
        {
            name: 'Product',
            children: [
                { name: 'Product Strategy', path: '/' },
                {
                    name: 'Roadmap',
                    children: [
                        { name: 'Q1 2024', path: '/' },
                        {
                            name: 'Q2 2024',
                            children: [
                                { name: 'Project A', path: '/' },
                                { name: 'Project B', path: '/' },
                            ],
                        },
                    ],
                },
                { name: 'User Research', path: '/' },
            ],
        },
        {
            name: 'Legal',
            children: [{ name: 'Legal', path: '/' }],
        },
    ];
    return (
        <div className={styles.uniSidebar}>
            <div className={styles.uniSidebarHeader}>
                <img src="./assets/images/logo.svg" alt="Logo" className={styles.uniLogo} />
            </div>
            <nav className={styles.uniSidebarNav}>
                <ul className={styles.uniSidebarNavTab}>
                    <li>
                        <NavLink to="/" exact="true" className={({ isActive }) => isActive ? styles.uniActive : ''}>
                            {({ isActive }) => (
                                <>
                                    {isActive ? <HomeFillSingle className={styles.uniIcon} /> : <HomeSingle className={styles.uniIcon} />}
                                    Home
                                </>
                            )}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/template" className={({ isActive }) => isActive ? styles.uniActive : ''}>
                            {({ isActive }) => (
                                <>
                                    {isActive ? <FolderFillSingle className={styles.uniIcon} /> : <FolderSingle className={styles.uniIcon} />}
                                    Template
                                </>
                            )}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/trash" className={({ isActive }) => isActive ? styles.uniActive : ''}>
                            {({ isActive }) => (
                                <>
                                    {isActive ? <TrashFillSingle className={styles.uniIcon} /> : <TrashSingle className={styles.uniIcon} />}
                                    Trash
                                </>
                            )}
                        </NavLink>
                    </li>
                    <div className={styles.uniDividingLine}></div>
                </ul>
                <TreeMenu data={treeData} />
            </nav>
            <div className={styles.uniSidebarFooter}>
                <div className={styles.uniDividingLine}></div>
                <NavLink to="/">
                    <PermissionSettingSingle />
                    Settings
                </NavLink>
                <NavLink to="/">
                    <DetailsSingle />
                    Help Center
                </NavLink>
            </div>
        </div>
    );
};
