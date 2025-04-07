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

import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { FWorksheet } from './f-worksheet';
import { generateRandomId, IAuthzIoService, ICommandService, Inject, Injector, IPermissionService, LocaleService } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { IDefinedNamesService, serializeRange } from '@univerjs/engine-formula';
import { RangeProtectionRuleModel, RemoveDefinedNameCommand, SCOPE_WORKBOOK_VALUE_DEFINED_NAME, SetDefinedNameCommand, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';

/**
 * Get defined name field name
 * @param {string} unitId - unit id
 * @param {LocaleService} localeService - locale service
 * @param {IDefinedNamesService} definedNamesService - defined names service
 * @returns {string} field name
 */
function getDefinedNameFieldName(unitId: string, localeService: LocaleService, definedNamesService: IDefinedNamesService): string {
    const definedNameMap = definedNamesService.getDefinedNameMap(unitId);
    if (definedNameMap == null) {
        return localeService.t('definedName.defaultName') + 1;
    }
    const definedNames = Array.from(Object.values(definedNameMap));
    const count = definedNames.length + 1;
    const name = localeService.t('definedName.defaultName') + count;
    if (definedNamesService.getValueByName(unitId, name) == null) {
        return name;
    }

    let i = count + 1;
    while (true) {
        const newName = localeService.t('definedName.defaultName') + i;
        if (definedNamesService.getValueByName(unitId, newName) == null) {
            return newName;
        }
        i++;
    }
}

/**
 * @hideconstructor
 */
export class FDefinedNameBuilder {
    private _definedNameParam: ISetDefinedNameMutationParam;

    constructor() {
        this._definedNameParam = {
            id: generateRandomId(10),
            unitId: '',
            name: '',
            formulaOrRefString: '',
            localSheetId: SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
        };
    }

    /**
     * Sets the name of the defined name builder.
     * @param {string} name The name of the defined name.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRef('Sheet1!$A$1')
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setName(name: string): FDefinedNameBuilder {
        this._definedNameParam.name = name;
        return this;
    }

    /**
     * Sets the formula of the defined name builder.
     * @param {string }formula The formula of the defined name.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setFormula('SUM(Sheet1!$A$1)')
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setFormula(formula: string): FDefinedNameBuilder {
        this._definedNameParam.formulaOrRefString = `=${formula}`;
        return this;
    }

    /**
     * Sets the reference of the defined name builder.
     * @param {string} a1Notation The reference of the defined name.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRef('Sheet1!$A$1')
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setRef(a1Notation: string): FDefinedNameBuilder {
        this._definedNameParam.formulaOrRefString = a1Notation;
        return this;
    }

    /**
     * Sets the reference of the defined name builder by range .
     * @param {number} row The start row index of the range. index start at 0.
     * @param {number} column The start column index of the range. index start at 0.
     * @param {number} numRows The number of rows in the range.
     * @param {number} numColumns The number of columns in the range.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRefByRange(1, 3, 2, 5) // D2:H3
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setRefByRange(row: number, column: number, numRows: number, numColumns: number): FDefinedNameBuilder {
        this._definedNameParam.formulaOrRefString = serializeRange({
            startRow: row,
            endRow: row + (numRows ?? 1) - 1,
            startColumn: column,
            endColumn: column + (numColumns ?? 1) - 1,
        });
        return this;
    }

    /**
     * Sets the comment of the defined name builder.
     * @param {string} comment The comment of the defined name.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRef('Sheet1!$A$1')
     *   .setComment('A reference to A1 cell in Sheet1')
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setComment(comment: string): FDefinedNameBuilder {
        this._definedNameParam.comment = comment;
        return this;
    }

    /**
     * Sets the scope of the defined name to the worksheet.
     * @param {FWorksheet} worksheet The worksheet to set the scope to.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const sheets = fWorkbook.getSheets();
     *
     * // Create a defined name and make it available only in the second worksheet
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRef('Sheet1!$A$1')
     *   .setScopeToWorksheet(sheets[1])
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setScopeToWorksheet(worksheet: FWorksheet): FDefinedNameBuilder {
        this._definedNameParam.localSheetId = worksheet.getSheetId();
        return this;
    }

    /**
     * Sets the scope of the defined name to the workbook.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     *
     * // Create a defined name and make it available in the entire workbook
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRef('Sheet1!$A$1')
     *   .setScopeToWorkbook()
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setScopeToWorkbook(): FDefinedNameBuilder {
        this._definedNameParam.localSheetId = SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
        return this;
    }

    /**
     * Sets the hidden status of the defined name builder.
     * @param {boolean} hidden The hidden status of the defined name.
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRef('Sheet1!$A$1')
     *   .setHidden(true)
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setHidden(hidden: boolean): FDefinedNameBuilder {
        this._definedNameParam.hidden = hidden;
        return this;
    }

    /**
     * Builds the defined name parameter.
     * @returns {ISetDefinedNameMutationParam} The defined name mutation parameter.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setName('MyDefinedName')
     *   .setRef('Sheet1!$A$1')
     *   .setComment('A reference to A1 cell in Sheet1')
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    build(): ISetDefinedNameMutationParam {
        return this._definedNameParam;
    }

    /**
     * Loads the defined name mutation parameter.
     * @param {ISetDefinedNameMutationParam} param - defined name mutation parameter
     * @returns {FDefinedNameBuilder} The instance of `FDefinedNameBuilder` for method chaining.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameParam = {
     *   id: '4TMPceoqg8',
     *   unitId: fWorkbook.getId(),
     *   name: 'MyDefinedName',
     *   formulaOrRefString: 'Sheet1!$A$1',
     * }
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .load(definedNameParam)
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    load(param: ISetDefinedNameMutationParam): FDefinedNameBuilder {
        this._definedNameParam = param;
        return this;
    }
}

/**
 * @hideconstructor
 */
export class FDefinedName extends FBase {
    constructor(
        protected _definedNameParam: ISetDefinedNameMutationParam,
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @IPermissionService protected readonly _permissionService: IPermissionService,
        @Inject(WorksheetProtectionRuleModel) protected readonly _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(RangeProtectionRuleModel) protected readonly _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionPointModel) protected readonly _worksheetProtectionPointRuleModel: WorksheetProtectionPointModel,
        @Inject(IAuthzIoService) protected readonly _authzIoService: IAuthzIoService,
        @Inject(LocaleService) protected readonly _localeService: LocaleService,
        @IDefinedNamesService protected readonly _definedNamesService: IDefinedNamesService
    ) {
        super();
    }

    private _apply(): void {
        if (this._definedNameParam.name === '') {
            this._definedNameParam.name = getDefinedNameFieldName(this._definedNameParam.unitId, this._localeService, this._definedNamesService);
        }
        this._commandService.syncExecuteCommand(SetDefinedNameCommand.id, this._definedNameParam);
    }

    /**
     * Gets the name of the defined name.
     * @returns {string} The name of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * console.log(definedName?.getName());
     * ```
     */
    getName(): string {
        return this._definedNameParam.name;
    }

    /**
     * Sets the name of the defined name.
     * @param {string} name The name of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setName('NewDefinedName');
     * ```
     */
    setName(name: string): void {
        this._definedNameParam.name = name;
        this._apply();
    }

    /**
     * Sets the formula of the defined name.
     * @param {string} formula The formula of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setFormula('SUM(Sheet1!$A$1)');
     * ```
     */
    setFormula(formula: string): void {
        this._definedNameParam.formulaOrRefString = `=${formula}`;
        this._apply();
    }

    /**
     * Sets the reference of the defined name.
     * @param {string} refString The reference of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setRef('Sheet1!$A$1');
     * ```
     */
    setRef(refString: string): void {
        this._definedNameParam.formulaOrRefString = refString;
        this._apply();
    }

    /**
     * Gets the formula or reference string of the defined name.
     * @returns {string} The formula or reference string of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * console.log(definedName?.getFormulaOrRefString());
     * ```
     */
    getFormulaOrRefString(): string {
        return this._definedNameParam.formulaOrRefString;
    }

    /**
     * Sets the reference of the defined name by range.
     * @param {number} row The start row of the range.
     * @param {number} column The start column of the range.
     * @param {number} numRows The number of rows in the range.
     * @param {number} numColumns The number of columns in the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setRefByRange(1, 3, 2, 5); // D2:H3
     * ```
     */
    setRefByRange(row: number, column: number, numRows: number, numColumns: number): void {
        this._definedNameParam.formulaOrRefString = serializeRange({
            startRow: row,
            endRow: row + (numRows ?? 1) - 1,
            startColumn: column,
            endColumn: column + (numColumns ?? 1) - 1,
        });
        this._apply();
    }

    /**
     * Gets the comment of the defined name.
     * @returns {string | undefined} The comment of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * console.log(definedName?.getComment());
     * ```
     */
    getComment(): string | undefined {
        return this._definedNameParam.comment;
    }

    /**
     * Sets the comment of the defined name.
     * @param {string} comment The comment of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setComment('This is a comment');
     * ```
     */
    setComment(comment: string): void {
        this._definedNameParam.comment = comment;
        this._apply();
    }

    /**
     * Sets the scope of the defined name to the worksheet.
     * @param {FWorksheet} worksheet The worksheet to set the scope to.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const sheets = fWorkbook.getSheets();
     *
     * // Get the first defined name and make it available only in the second worksheet
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setScopeToWorksheet(sheets[1]);
     * ```
     */
    setScopeToWorksheet(worksheet: FWorksheet): void {
        this._definedNameParam.localSheetId = worksheet.getSheetId();
        this._apply();
    }

    /**
     * Sets the scope of the defined name to the workbook.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setScopeToWorkbook();
     * ```
     */
    setScopeToWorkbook(): void {
        this._definedNameParam.localSheetId = SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
        this._apply();
    }

    /**
     * Sets the hidden status of the defined name.
     * @param {boolean} hidden The hidden status of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.setHidden(true);
     * ```
     */
    setHidden(hidden: boolean): void {
        this._definedNameParam.hidden = hidden;
        this._apply();
    }

    /**
     * Deletes the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * definedName?.delete();
     * ```
     */
    delete(): void {
        this._commandService.syncExecuteCommand(RemoveDefinedNameCommand.id, this._definedNameParam);
    }

    /**
     * Gets the local sheet id of the defined name.
     * @returns {string | undefined} The local sheet id of the defined name.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * console.log(definedName?.getLocalSheetId());
     * ```
     */
    getLocalSheetId(): string | undefined {
        return this._definedNameParam.localSheetId;
    }

    /**
     * Checks if the defined name is in the workbook scope.
     * @returns {boolean} True if the defined name is in the workbook scope, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * console.log(definedName?.isWorkbookScope());
     * ```
     */
    isWorkbookScope(): boolean {
        return this._definedNameParam.localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
    }

    /**
     * Converts the defined name to a defined name builder.
     * @returns {FDefinedNameBuilder} The defined name builder.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedName = fWorkbook.getDefinedNames()[0];
     * if (!definedName) return;
     * const definedNameBuilder = definedName
     *   .toBuilder()
     *   .setName('NewDefinedName')
     *   .setFormula('SUM(Sheet1!$A$1)')
     *   .build();
     * fWorkbook.updateDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    toBuilder(): FDefinedNameBuilder {
        const builder = this._injector.createInstance(FDefinedNameBuilder);
        builder.load(this._definedNameParam);
        return builder;
    }
}
