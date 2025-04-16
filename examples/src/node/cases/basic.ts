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

import process from 'node:process';
import { awaitTime } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { createUniverOnNode } from '../sdk';

// From now on, Univer is a full-stack SDK.

async function run(): Promise<void> {
    const API = FUniver.newAPI(createUniverOnNode());
    const univerSheet = API.createUniverSheet({});

    const a1 = univerSheet.getActiveSheet().getRange('A1');
    await a1.setValue({ v: 123 });

    const b1 = univerSheet.getActiveSheet().getRange('B1');
    await b1.setValue({ f: '=SUM(A1) * 6' });

    await awaitTime(500);

    // eslint-disable-next-line no-console
    console.log('Debug, formula value', b1.getCellData()?.v);

    // eslint-disable-next-line no-console
    console.log(univerSheet.save());

    process.exit(0);
}

run();
