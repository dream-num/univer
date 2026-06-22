import process from 'node:process';
import { awaitTime } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { createUniverOnNode } from '../sdk';

// From now on, Univer is a full-stack SDK.

async function run(): Promise<void> {
    const API = FUniver.newAPI(createUniverOnNode());
    const univerSheet = API.createWorkbook({});

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
