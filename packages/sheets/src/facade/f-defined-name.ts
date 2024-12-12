/**
 * Copyright 2023-present DreamNum Inc.
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

import type { FWorksheet } from './f-worksheet';
import { FBase, generateRandomId, IAuthzIoService, ICommandService, Inject, Injector, IPermissionService, LocaleService } from '@univerjs/core';
import { IDefinedNamesService, type ISetDefinedNameMutationParam, serializeRange } from '@univerjs/engine-formula';
import { RangeProtectionRuleModel, RemoveDefinedNameCommand, SCOPE_WORKBOOK_VALUE_DEFINED_NAME, SetDefinedNameCommand, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';

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

export class FDefinedNameBuilder {
    private _definedNameParam: ISetDefinedNameMutationParam;
    constructor() {
        this._definedNameParam = {
            id: generateRandomId(10),
            unitId: '',
            name: '',
            formulaOrRefString: '',
        };
    }

    /**
     * Sets the name of the defined name builder.
     * @param name  The name of the defined name.
     * @returns The defined name builder.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedNameBuilder = UniverAPI.newDefinedName()
     *    .setName('MyDefinedName')
     *  .build();
     * workbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setName(name: string) {
        this._definedNameParam.name = name;
        return this;
    }

    /**
     * Sets the formula of the defined name builder.
     * @param formula The formula of the defined name.
     * @returns The defined name builder.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedNameBuilder = UniverAPI.newDefinedName()
     *  .setFormula('SUM(Sheet1!$A$1)')
     * .setName('MyDefinedName')
     * .build();
     * workbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setFormula(formula: string) {
        this._definedNameParam.formulaOrRefString = `=${formula}`;
        return this;
    }

    /**
     * Sets the reference of the defined name builder.
     * @param refString The reference of the defined name.
     * @returns The defined name builder.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedNameBuilder = UniverAPI.newDefinedName()
     *  .setRef('Sheet1!$A$1')
     * .build();
     * workbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setRef(a1Notation: string) {
        this._definedNameParam.formulaOrRefString = a1Notation;
        return this;
    }

    /**
     * Sets the reference of the defined name builder by range .
     * @param row The start row of the range.
     * @param column The start column of the range.
     * @param numRows The number of rows in the range.
     * @param numColumns The number of columns in the range.
     * @returns The defined name builder.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedNameBuilder = UniverAPI.newDefinedName()
     *  .setRefByRange(1, 3, 2, 5)
     * .build();
     * workbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setRefByRange(row: number, column: number, numRows: number, numColumns: number) {
        this._definedNameParam.formulaOrRefString = serializeRange({
            startRow: row,
            endRow: row + (numRows ?? 1) - 1,
            startColumn: column,
            endColumn: column + (numColumns ?? 1) - 1,
        });
        return this;
    }

    setFormulaOrRefString() {

    }

    /**
     * Sets the comment of the defined name builder.
     * @param comment The comment of the defined name.
     * @returns The defined name builder.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedNameBuilder = UniverAPI.newDefinedName()
     *  .setComment('This is a comment')
     * .build();
     * workbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setComment(comment: string) {
        this._definedNameParam.comment = comment;
        return this;
    }

    /**
     * Sets the hidden status of the defined name builder.
     * @param hidden The hidden status of the defined name.
     * @returns The defined name builder.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedNameBuilder = UniverAPI.newDefinedName()
     *  .setHidden(true)
     * .build();
     * workbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    setHidden(hidden: boolean) {
        this._definedNameParam.hidden = hidden;
        return this;
    }

    /**
     * Builds the defined name.
     * @returns The defined name mutation parameter.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedNameBuilder = UniverAPI.newDefinedName()
     *  .setRef('Sheet1!$A$1')
     *  .setName('MyDefinedName')
     *  .build();
     * workbook.insertDefinedNameBuilder(definedNameBuilder);
     * ```
     */
    build(): ISetDefinedNameMutationParam {
        return this._definedNameParam;
    }

    load(param: ISetDefinedNameMutationParam) {
        this._definedNameParam = param;
        return this;
    }
}

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

    private _apply() {
        if (this._definedNameParam.name === '') {
            this._definedNameParam.name = getDefinedNameFieldName(this._definedNameParam.unitId, this._localeService, this._definedNamesService);
        }
        this._commandService.syncExecuteCommand(SetDefinedNameCommand.id, this._definedNameParam);
    }

    /**
     * Gets the name of the defined name.
     * @returns The name of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * console.log(definedName.getName());
     * ```
     */
    getName() {
        return this._definedNameParam.name;
    }

    /**
     * Sets the name of the defined name.
     * @param name The name of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedName('MyDefinedName');
     * definedName.setName('NewDefinedName');
     * ```
     */
    setName(name: string) {
        this._definedNameParam.name = name;
        this._apply();
    }

    /**
     * Sets the formula of the defined name.
     * @param formula The formula of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedName('MyDefinedName');
     * definedName.setFormula('SUM(Sheet1!$A$1)');
     * ```
     */
    setFormula(formula: string) {
        this._definedNameParam.formulaOrRefString = `=${formula}`;
        this._apply();
    }

    /**
     * Sets the reference of the defined name.
     * @param refString The reference of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * definedName.setRef('Sheet1!$A$1');
     * ```
     */
    setRef(refString: string) {
        this._definedNameParam.formulaOrRefString = refString;
        this._apply();
    }

    /**
     * Gets the reference of the defined name.
     * @returns The reference of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * console.log(definedName.getFormulaOrRefString());
     * ```
     */
    getFormulaOrRefString() {
        return this._definedNameParam.formulaOrRefString;
    }

    /**
     * Sets the reference of the defined name by range.
     * @param row The start row of the range.
     * @param column The start column of the range.
     * @param numRows The number of rows in the range.
     * @param numColumns The number of columns in the range.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * definedName.setRefByRange(1, 3, 2, 5);
     * ```
     */
    setRefByRange(row: number, column: number, numRows: number, numColumns: number) {
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
     * @returns The comment of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * console.log(definedName.getComment());
     * ```
     */
    getComment() {
        return this._definedNameParam.comment;
    }

    /**
     * Sets the comment of the defined name.
     * @param comment The comment of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * definedName.setComment('This is a comment');
     * ```
     */
    setComment(comment: string) {
        this._definedNameParam.comment = comment;
        this._apply();
    }

    /**
     * Sets the scope of the defined name to the worksheet.
     * @param worksheet The worksheet to set the scope to.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const worksheet = workbook.getWorksheets[0];
     * const definedName = workbook.getDefinedNames[0];
     * definedName.setScopeToWorksheet(worksheet);
     * ```
     */
    setScopeToWorksheet(worksheet: FWorksheet) {
        this._definedNameParam.localSheetId = worksheet.getSheetId();
        this._apply();
    }

    /**
     * Sets the scope of the defined name to the workbook.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * definedName.setScopeToWorkbook();
     * ```
     */
    setScopeToWorkbook() {
        this._definedNameParam.localSheetId = SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
        this._apply();
    }

    /**
     * Sets the hidden status of the defined name.
     * @param hidden The hidden status of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * definedName.setHidden(true);
     * ```
     */
    setHidden(hidden: boolean) {
        this._definedNameParam.hidden = hidden;
        this._apply();
    }

    /**
     * Deletes the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * definedName.delete();
     * ```
     */
    delete() {
        this._commandService.syncExecuteCommand(RemoveDefinedNameCommand.id, this._definedNameParam);
    }

    /**
     * Gets the local sheet id of the defined name.
     * @returns The local sheet id of the defined name.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * console.log(definedName.getLocalSheetId());
     * ```
     */
    getLocalSheetId() {
        return this._definedNameParam.localSheetId;
    }

    /**
     * Checks if the defined name is in the workbook scope.
     * @returns True if the defined name is in the workbook scope, false otherwise.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * console.log(definedName.isWorkbookScope());
     * ```
     */
    isWorkbookScope() {
        return this._definedNameParam.localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
    }

    /**
     * Converts the defined name to a defined name builder.
     * @returns The defined name builder.
     * @example
     * ```ts
     * const workbook = UniverAPI.getActiveWorkbook();
     * const definedName = workbook.getDefinedNames[0];
     * const definedNameBuilder = definedName.toBuilder();
     * const param definedNameBuilder.setName('NewDefinedName').setFormula('SUM(Sheet1!$A$1)').build();
     * workbook.updateDefinedNameBuilder(param);
     * ```
     */
    toBuilder() {
        const builder = this._injector.createInstance(FDefinedNameBuilder);
        builder.load(this._definedNameParam);
        return builder;
    }
}
