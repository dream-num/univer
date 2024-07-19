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
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import lightTheme from '../../themes/lightTheme.module.less';
import darkTheme from '../../themes/darkTheme.module.less';
import { convertToDashCase } from '../../themes/util';
import { Home } from './home/Home';
import { Template } from './template/Template';
import { Trash } from './trash/Trash';
import { MainLayout } from './main-layout/MainLayout';
import './index.css';

const applyTheme = () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const theme = isDarkMode ? darkTheme : lightTheme;
    Object.keys(theme).forEach((key) => {
        document.documentElement.style.setProperty(convertToDashCase(key), theme[key]);
    });
};

applyTheme();

const observer = new MutationObserver(applyTheme);
observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
});

export const UniHomeApp: React.FC = () => {
    return (
        <Router basename="/uni-home">
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="template" element={<Template />} />
                    <Route path="trash" element={<Trash />} />
                </Route>
            </Routes>
        </Router>
    );
};
