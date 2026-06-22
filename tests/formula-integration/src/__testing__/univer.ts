import { FUniver } from '@univerjs/core/facade';
import { createUniverOnNode } from 'univer-examples/node/index.ts';

export function createFormulaTestBed() {
    const univer = createUniverOnNode();
    const injector = univer.__getInjector();

    return {
        univer,
        get: injector.get.bind(injector),
        api: FUniver.newAPI(univer),
    };
}
