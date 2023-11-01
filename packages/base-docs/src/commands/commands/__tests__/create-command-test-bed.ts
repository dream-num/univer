import {
    BooleanNumber,
    IDocumentData,
    ILogService,
    IUniverInstanceService,
    Plugin,
    PluginType,
    Univer,
} from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { TextSelectionManagerService } from '../../../services/text-selection-manager.service';

const TEST_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'test-doc',
    body: {
        dataStream: 'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies\r\n',
        textRuns: [
            {
                st: 0,
                ed: 67,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
        ],
        paragraphs: [],
        sectionBreaks: [],
        customBlocks: [],
    },
    documentStyle: {
        pageSize: {
            width: 594.3,
            height: 840.51,
        },
        marginTop: 72,
        marginBottom: 72,
        marginRight: 90,
        marginLeft: 90,
    },
};

export function createCommandTestBed(workbookConfig?: IDocumentData, dependencies?: Dependency[]) {
    const univer = new Univer();

    let get: Injector['get'] | undefined;

    /**
     * This plugin hooks into Doc's DI system to expose API to test scripts
     */
    class TestSpyPlugin extends Plugin {
        static override type = PluginType.Doc;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');

            this._injector = _injector;
            get = this._injector.get.bind(this._injector);
        }

        override onStarting(injector: Injector): void {
            injector.add([TextSelectionManagerService]);

            dependencies?.forEach((d) => injector.add(d));
        }

        override onDestroy(): void {
            get = undefined;
        }
    }

    univer.registerPlugin(TestSpyPlugin);
    const doc = univer.createUniverDoc(workbookConfig || TEST_DOCUMENT_DATA_EN);

    if (get === undefined) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test-doc');

    const logService = get(ILogService);
    logService.toggleLogEnabled(false); // change this to `true` to debug tests via logs

    return {
        univer,
        get,
        doc,
    };
}
