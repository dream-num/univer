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

import { RediContext } from '@univerjs/core';
import { initTheme } from '../../themes/util';
import { UnitFilesService } from '../../services/unit-home/unit-files.service';
import { useNewRootInjector } from '../../components/hooks/use-injector';
import { Home } from './home/Home';
import { Template } from './template/Template';
import { Trash } from './trash/Trash';
import { MainLayout } from './main-layout/MainLayout';
import './index.css';

initTheme();

export const UniHomeApp: React.FC = () => {
    const injectorContextValue = useNewRootInjector(() => ([
        [UnitFilesService],
    ]));

    return (
        <RediContext.Provider value={injectorContextValue}>
            <Router basename="/uni-home">
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="template" element={<Template />} />
                        <Route path="trash" element={<Trash />} />
                    </Route>
                </Routes>
            </Router>

        </RediContext.Provider>

    );
};
