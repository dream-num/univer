import type { Nullable } from '@univerjs/core';
import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    HorizontalAlign,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { getDocObject } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { Subscription } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, InitializeEditorController)
export class InitializeEditorController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        // TODO: @JOCS, remove use setTimeout.
        setTimeout(() => {
            this._initialize();
        }, 0);

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        // create univer doc sheet cell editor instance
        this._currentUniverService.createDoc({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
                textRuns: [],
                paragraphs: [
                    {
                        startIndex: 0,
                    },
                ],
            },
            documentStyle: {},
        });

        // create univer doc formula bar editor instance
        const INITIAL_SNAPSHOT = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
                textRuns: [],
                paragraphs: [
                    {
                        startIndex: 0,
                    },
                ],
            },
            documentStyle: {
                pageSize: {
                    width: Infinity,
                    height: Infinity,
                },
                marginTop: 5,
                marginBottom: 5,
                marginRight: 0,
                marginLeft: 0,
                paragraphLineGapDefault: 0,
                renderConfig: {
                    horizontalAlign: HorizontalAlign.UNSPECIFIED,
                    verticalAlign: VerticalAlign.UNSPECIFIED,
                    centerAngle: 0,
                    vertexAngle: 0,
                    wrapStrategy: WrapStrategy.WRAP,
                },
            },
        };

        this._currentUniverService.createDoc(INITIAL_SNAPSHOT);
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
