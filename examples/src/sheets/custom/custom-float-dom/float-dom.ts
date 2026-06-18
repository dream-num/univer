import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { DisposableCollection } from '@univerjs/core';
import { CustomRangeLoading } from './component';

export function insertFloatDom(univer: Univer, univerAPI: FUniver) {
    const disposableCollection = new DisposableCollection();
    const floatDomDisposables = new DisposableCollection();

    disposableCollection.add(univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
        if (stage === univerAPI.Enum.LifecycleStages.Steady) {
            univerAPI.registerComponent('CustomRangeLoading', CustomRangeLoading);

            const fWorkbook = univerAPI.getActiveWorkbook()!;
            const fWorksheet = fWorkbook.getActiveSheet();
            const fRange = fWorksheet.getRange('A1:C3');
            const disposable = fWorksheet.addFloatDomToRange(fRange, { componentKey: 'CustomRangeLoading' }, {}, 'myRangeLoading');
            if (disposable) {
                floatDomDisposables.add(disposable);
            }
            console.warn('Float DOM', disposable);
            // remove float dom
            // if (disposable) {
            //     disposable.dispose();
            //     //or
            //     fWorksheet.removeFloatDom(disposable.id);
            // }
        }
    }));

    univer.onDispose(() => {
        floatDomDisposables.dispose();
        disposableCollection.dispose();
    });
}
