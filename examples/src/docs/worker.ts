import { Univer } from '@univerjs/core';
import { UniverDocsWorkerPlugin } from '@univerjs/docs/worker';

const univer = new Univer();
univer.registerPlugin(UniverDocsWorkerPlugin);
