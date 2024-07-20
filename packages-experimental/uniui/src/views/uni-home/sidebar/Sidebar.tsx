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
import { useDependency } from '@univerjs/core';
import { UnitFilesService } from '../../../services/unit-home/unit-files.service';
import { TreeMenu } from './tree-menu/TreeMenu';
import styles from './index.module.less';

export const Sidebar: React.FC = () => {
    const unitFilesService = useDependency(UnitFilesService);
    const treeMenuFiles = unitFilesService.getTreeMenuFiles();

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
                    <div className={styles.uniDivider}></div>
                </ul>
                <TreeMenu data={treeMenuFiles} />
            </nav>
            <div className={styles.uniSidebarFooter}>
                <div className={styles.uniDivider}></div>
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
