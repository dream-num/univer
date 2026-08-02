import type { IRange, IWorkbookData, Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import type { FWorksheet } from '@univerjs/sheets/facade';
import { LocaleType, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { ICanvasPopupService } from '@univerjs/ui';
import * as RefRangeE2EProtocol from './ref-range-e2e.protocol';

const FIXTURE_COMPONENT_KEY = 'RefRangeFeaturePopupProbe';
const FIXTURE_UNIT_ID = 'ref-range-feature-e2e-unit';
const FIXTURE_SHEET_ID = 'ref-range-feature-e2e-sheet';

function RefRangeFeaturePopupProbe() {
    return (
        <div
            data-ref-range-feature-popup="true"
            style={{ width: 80, height: 32 }}
        />
    );
}

function createWorkbookData(): IWorkbookData {
    return {
        id: FIXTURE_UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'RefRange Feature E2E',
        sheetOrder: [FIXTURE_SHEET_ID],
        styles: {},
        sheets: {
            [FIXTURE_SHEET_ID]: {
                id: FIXTURE_SHEET_ID,
                name: 'Feature Matrix',
                rowCount: 120,
                columnCount: 30,
                cellData: {
                    1: { 1: { v: 1 } },
                    15: { 3: { v: 'Region' }, 4: { v: 'Sales' }, 5: { v: 'Enabled' } },
                    16: { 3: { v: 'East' }, 4: { v: 20 }, 5: { v: true } },
                    17: { 3: { v: 'West' }, 4: { v: 30 }, 5: { v: true } },
                },
            },
        },
    };
}

function waitForRender(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function rangeRecord(range: IRange): RefRangeE2EProtocol.IRangeRecord {
    return {
        startRow: range.startRow,
        endRow: range.endRow,
        startColumn: range.startColumn,
        endColumn: range.endColumn,
    };
}

function isRequestDetail(value: unknown): value is RefRangeE2EProtocol.IRefRangeE2ERequestDetail {
    return typeof value === 'object' && value !== null &&
        'request' in value &&
        'resolve' in value && typeof value.resolve === 'function' &&
        'reject' in value && typeof value.reject === 'function';
}

function requireSingle<T>(values: T[], feature: string): T {
    if (values.length !== 1) throw new Error(`Expected one ${feature}, received ${values.length}`);
    return values[0];
}

class RefRangeE2EFixture {
    private _isSetup = false;

    constructor(
        private readonly _univer: Univer,
        private readonly _univerAPI: FUniver,
        private readonly _canvasPopupService: ICanvasPopupService
    ) {}

    install(): void {
        this._univerAPI.registerComponent(FIXTURE_COMPONENT_KEY, RefRangeFeaturePopupProbe);
        window.addEventListener(RefRangeE2EProtocol.REF_RANGE_E2E_EVENT, this._onRequest);
        document.documentElement.setAttribute(RefRangeE2EProtocol.REF_RANGE_E2E_READY_ATTRIBUTE, 'true');
    }

    private readonly _onRequest = (event: Event): void => {
        if (!(event instanceof CustomEvent) || !isRequestDetail(event.detail)) return;
        this._execute(event.detail.request).then(event.detail.resolve, event.detail.reject);
    };

    private async _execute(request: RefRangeE2EProtocol.RefRangeE2ERequest): Promise<unknown> {
        switch (request.action) {
            case 'setup':
                return this._setup();
            case 'snapshot':
                return this._snapshot();
            case 'apply':
                await this._apply(request.axis, request.operation, request.index);
                return null;
            case 'undo':
                return Boolean(await this._univerAPI.executeCommand(UndoCommand.id));
        }
    }

    private async _setup(): Promise<RefRangeE2EProtocol.IFixtureSnapshot> {
        if (this._isSetup) return this._snapshot();

        await new Promise((resolve) => setTimeout(resolve, 500));
        this._univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        await waitForRender();
        await new Promise((resolve) => setTimeout(resolve, 200));
        const sheet = this._requireSheet();

        sheet.getRange('D10:E11').merge();
        await sheet.getRange('G10:H11').getRangePermission().protect({ name: 'RefRange E2E protection' });
        if (!sheet.getRange('D16:F22').createFilter()) throw new Error('Failed to create E2E filter');

        const dataValidation = this._univerAPI.newDataValidation()
            .requireFormulaSatisfied('=B2>0')
            .build();
        sheet.getRange('D26:E27').setDataValidation(dataValidation);

        const conditionalFormatting = sheet.newConditionalFormattingRule()
            .whenFormulaSatisfied('=B2>0')
            .setBackground('#fef3c7')
            .setRanges([sheet.getRange('G26:H27').getRange()])
            .build();
        sheet.addConditionalFormattingRule(conditionalFormatting);

        await sheet.getRange('D32').setHyperLink(sheet.getRange('G32:H33').getUrl(), 'Target range');
        sheet.getRange('D36').createOrUpdateNote({
            note: 'RefRange E2E note',
            width: 160,
            height: 80,
            show: false,
        });
        const comment = this._univerAPI.newTheadComment()
            .setId('ref-range-e2e-comment')
            .setContent(this._univerAPI.newRichText().insertText('RefRange E2E comment'));
        if (!await sheet.getRange('G36').addCommentAsync(comment)) throw new Error('Failed to create E2E comment');

        await this._waitForCellRect(sheet);
        const popup = sheet.getRange('D4:E5').attachRangePopup({
            componentKey: FIXTURE_COMPONENT_KEY,
            direction: 'bottom-center',
        });
        if (!popup) throw new Error('Failed to attach E2E range popup');
        this._univerAPI.getActiveWorkbook()?.setActiveRange(sheet.getRange('D4:E5'));

        this._isSetup = true;
        await waitForRender();
        return this._snapshot();
    }

    private async _snapshot(): Promise<RefRangeE2EProtocol.IFixtureSnapshot> {
        const sheet = this._requireSheet();
        const merge = requireSingle(sheet.getMergedRanges(), 'merged range');
        const protection = requireSingle(
            await sheet.getWorksheetPermission().listRangeProtectionRules({ ignoreCollaborators: true }),
            'range protection'
        );
        const filter = sheet.getFilter();
        if (!filter) throw new Error('E2E filter is missing');
        const dataValidation = requireSingle(sheet.getDataValidations(), 'data validation');
        const conditionalFormatting = requireSingle(sheet.getConditionalFormattingRules(), 'conditional formatting rule');
        const hyperlink = requireSingle(sheet.getRange('A1:Z60').getHyperLinks(), 'hyperlink');
        const note = requireSingle(sheet.getNotes(), 'note');
        const comment = this._findComment(sheet);
        const popupRect = this._getPopupRect();

        return {
            merge: rangeRecord(merge.getRange()),
            protection: rangeRecord(requireSingle(protection.ranges, 'protected range').getRange()),
            filter: rangeRecord(filter.getRange().getRange()),
            dataValidation: rangeRecord(requireSingle(dataValidation.rule.ranges, 'data validation range')),
            conditionalFormatting: rangeRecord(requireSingle(conditionalFormatting.ranges, 'conditional formatting range')),
            hyperlink: { row: hyperlink.row, column: hyperlink.column },
            note: { row: note.row, column: note.col },
            comment,
            dataValidationFormula: dataValidation.getCriteriaValues()[1],
            conditionalFormattingRule: JSON.stringify(conditionalFormatting.rule),
            hyperlinkUrl: hyperlink.url,
            popupRect: {
                ...popupRect,
            },
        };
    }

    private async _apply(
        axis: RefRangeE2EProtocol.FixtureAxis,
        operation: RefRangeE2EProtocol.FixtureOperation,
        index: number
    ): Promise<void> {
        const sheet = this._requireSheet();
        if (axis === 'row') {
            if (operation === 'insert') sheet.insertRowBefore(index);
            else sheet.deleteRow(index);
        } else if (operation === 'insert') {
            sheet.insertColumnBefore(index);
        } else {
            sheet.deleteColumn(index);
        }
        await waitForRender();
    }

    private _getPopupRect(): RefRangeE2EProtocol.IRectRecord {
        const popup = requireSingle(
            this._canvasPopupService.popups
                .map(([, item]) => item)
                .filter((item) => item.componentKey === FIXTURE_COMPONENT_KEY),
            'range popup'
        );
        let popupAnchor = popup.anchorRect;
        const popupSubscription = popup.anchorRect$.subscribe((anchor) => {
            popupAnchor = anchor;
        });
        popupSubscription.unsubscribe();
        if (!popupAnchor) throw new Error('E2E popup anchor is missing');
        return {
            left: popupAnchor.left,
            top: popupAnchor.top,
            width: popupAnchor.right - popupAnchor.left,
            height: popupAnchor.bottom - popupAnchor.top,
        };
    }

    private async _waitForCellRect(sheet: FWorksheet): Promise<void> {
        const deadline = Date.now() + 2_000;
        while (Date.now() < deadline) {
            const rect = sheet.getRange('D4').getCellRect();
            if (rect.left > 0 && rect.top > 0 && rect.width > 0 && rect.height > 0) return;
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
        throw new Error('Timed out waiting for E2E sheet skeleton');
    }

    private _findComment(sheet: FWorksheet): RefRangeE2EProtocol.IPointRecord {
        for (let row = 30; row < 45; row++) {
            for (let column = 0; column < 10; column++) {
                if (sheet.getRange(row, column).getComment()?.getCommentData().id === 'ref-range-e2e-comment') {
                    return { row, column };
                }
            }
        }
        throw new Error('E2E comment is missing');
    }

    private _requireSheet(): FWorksheet {
        const sheet = this._univerAPI.getActiveWorkbook()?.getActiveSheet();
        if (!sheet) throw new Error('RefRange E2E sheet is not active');
        return sheet;
    }
}

export function installRefRangeE2EFixture(univer: Univer, univerAPI: FUniver): void {
    const injector = univer.__getInjector();
    const canvasPopupService = injector.get(ICanvasPopupService);
    new RefRangeE2EFixture(univer, univerAPI, canvasPopupService).install();
}
