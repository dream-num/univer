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

import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    DocumentDataModel,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { DocSelectionManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService, NORMAL_TEXT_SELECTION_PLUGIN_STYLE, RenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { DocMenuStyleService } from '../doc-menu-style.service';

class TestRenderManagerService {
    editArea: DocumentEditArea | undefined;

    getRenderById() {
        if (this.editArea == null) {
            return;
        }

        return {
            with: () => ({
                getViewModel: () => ({
                    getEditArea: () => this.editArea,
                }),
            }),
        };
    }
}

function createService(): DocMenuStyleService {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocMenuStyleService]);
    return injector.get(DocMenuStyleService);
}

function createStyleTestBed() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocMenuStyleService]);

    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(new DocumentDataModel({
        id: 'doc-menu-style',
        body: {
            dataStream: 'Title\r\n',
            paragraphs: [{ paragraphId: 'para_docs_ui_menu_style_fixture_1', startIndex: 5 }],
            sectionBreaks: [],
            customRanges: [],
            tables: [],
            textRuns: [],
        },
    }));
    univerInstanceService.setCurrentUnitForType('doc-menu-style');

    return {
        injector,
        service: injector.get(DocMenuStyleService),
        selectionManager: injector.get(DocSelectionManagerService),
        commandService: injector.get(ICommandService),
        renderManagerService: injector.get(IRenderManagerService) as unknown as TestRenderManagerService,
    };
}

describe('DocMenuStyleService', () => {
    it('merges cached text styles used by the next document input', () => {
        const service = createService();

        service.setStyleCache({ bl: 1 });
        service.setStyleCache({ it: 1 });

        expect(service.getStyleCache()).toEqual({ bl: 1, it: 1 });
    });

    it('uses body text defaults when there is no focused document render', () => {
        const service = createService();

        expect(service.getDefaultStyle()).toEqual({ ff: 'Arial', fs: 11 });
    });

    it('uses body and header footer defaults from the active document render area', () => {
        const { service, renderManagerService } = createStyleTestBed();

        renderManagerService.editArea = DocumentEditArea.BODY;
        expect(service.getDefaultStyle()).toEqual({ ff: 'Arial', fs: 11 });

        renderManagerService.editArea = DocumentEditArea.FOOTER;
        expect(service.getDefaultStyle()).toEqual({ ff: 'Arial', fs: 9 });
    });

    it('clears cached input style when document selection changes', () => {
        const { service, selectionManager, commandService } = createStyleTestBed();
        commandService.registerCommand(SetTextSelectionsOperation);

        service.setStyleCache({ fs: 18, bl: 1 });
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'doc-menu-style', subUnitId: 'doc-menu-style' });
        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId: 'doc-menu-style', subUnitId: 'doc-menu-style' });

        expect(service.getStyleCache()).toBeNull();
    });
});
