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
import { HomeFillSingle, KeyboardSingle, TrashSingle } from '@univerjs/icons';
import { TreeMenu } from './tree-menu/TreeMenu';
import styles from './index.module.less';

export const Sidebar: React.FC = () => {
    const treeData = [
        {
            name: 'R&D',
            children: [
                { name: 'Sales Performance', path: '/sales/performance' },
                { name: 'Competitor Analysis', path: '/competitor-analysis' },
                {
                    name: 'User Feedback',
                    children: [
                        { name: 'Survey Results', path: '/user-feedback/survey' },
                        { name: 'Interviews', path: '/user-feedback/interviews' },
                    ],
                },
                { name: 'Customer Outreach', path: '/customer-outreach' },
            ],
        },
        {
            name: 'Product',
            children: [
                { name: 'Product Strategy', path: '/product-strategy' },
                {
                    name: 'Roadmap',
                    children: [
                        { name: 'Q1 2024', path: '/roadmap/q1-2024' },
                        {
                            name: 'Q2 2024',
                            children: [
                                { name: 'Project A', path: '/roadmap/q2-2024/project-a' },
                                { name: 'Project B', path: '/roadmap/q2-2024/project-b' },
                            ],
                        },
                    ],
                },
                { name: 'User Research', path: '/user-research' },
            ],
        },
        {
            name: 'Legal',
            children: [{ name: 'Legal', path: '/legal' }],
        },
    ];
    return (
        <div className={styles.uniSidebar}>
            <div className={styles.uniSidebarHeader}>
                <img src="/uni-home/assets/images/univerworkspace-logo.svg" alt="Logo" className={styles.uniLogo} />
            </div>
            <nav className={styles.uniSidebarNav}>
                <ul>
                    <li>
                        <NavLink to="/" exact activeClassName={styles.uniActive}>
                            <HomeFillSingle className={styles.uniIcon} />
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/template" activeClassName={styles.uniActive}>
                            <KeyboardSingle className={styles.uniIcon} />
                            Template
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/trash" activeClassName={styles.uniActive}>
                            <TrashSingle className={styles.uniIcon} />
                            Trash
                        </NavLink>
                    </li>
                </ul>
                <TreeMenu data={treeData} />
            </nav>
            <div className={styles.uniSidebarFooter}>
                <NavLink to="/settings">Settings</NavLink>
                <NavLink to="/help">Help Center</NavLink>
            </div>
        </div>
    );
};
