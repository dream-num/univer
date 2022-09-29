"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModelGenerator = void 0;
/* eslint-disable no-bitwise */
const ts = __importStar(require("typescript"));
const api_extractor_model_1 = require("@microsoft/api-extractor-model");
const ExcerptBuilder_1 = require("./ExcerptBuilder");
const AstSymbol_1 = require("../analyzer/AstSymbol");
const DeclarationReferenceGenerator_1 = require("./DeclarationReferenceGenerator");
const AstNamespaceImport_1 = require("../analyzer/AstNamespaceImport");
const TypeScriptInternals_1 = require("../analyzer/TypeScriptInternals");
class ApiModelGenerator {
    constructor(collector) {
        this._collector = collector;
        this._apiModel = new api_extractor_model_1.ApiModel();
        this._referenceGenerator = new DeclarationReferenceGenerator_1.DeclarationReferenceGenerator(collector.packageJsonLookup, collector.workingPackage.name, collector.program, collector.typeChecker, collector.bundledPackageNames);
    }
    get apiModel() {
        return this._apiModel;
    }
    buildApiPackage() {
        const packageDocComment = this._collector.workingPackage.tsdocComment;
        const apiPackage = new api_extractor_model_1.ApiPackage({
            name: this._collector.workingPackage.name,
            docComment: packageDocComment,
            tsdocConfiguration: this._collector.extractorConfig.tsdocConfiguration
        });
        this._apiModel.addMember(apiPackage);
        const apiEntryPoint = new api_extractor_model_1.ApiEntryPoint({ name: '' });
        apiPackage.addMember(apiEntryPoint);
        // Create a CollectorEntity for each top-level export
        for (const entity of this._collector.entities) {
            if (entity.exported) {
                // this._processAstEntity(entity.astEntity, entity.nameForEmit, apiEntryPoint);
                const exportedName = Array.from(entity.exportNames)[0] || entity.nameForEmit;
                this._processAstEntity(entity.astEntity, exportedName, apiEntryPoint);
            }
        }
        return apiPackage;
    }
    _processAstEntity(astEntity, exportedName, parentApiItem) {
        if (astEntity instanceof AstSymbol_1.AstSymbol) {
            // Skip ancillary declarations; we will process them with the main declaration
            for (const astDeclaration of this._collector.getNonAncillaryDeclarations(astEntity)) {
                this._processDeclaration(astDeclaration, exportedName, parentApiItem);
            }
            return;
        }
        if (astEntity instanceof AstNamespaceImport_1.AstNamespaceImport) {
            // Note that a single API item can belong to two different AstNamespaceImport namespaces.  For example:
            //
            //   // file.ts defines "thing()"
            //   import * as example1 from "./file";
            //   import * as example2 from "./file";
            //
            //   // ...so here we end up with example1.thing() and example2.thing()
            //   export { example1, example2 }
            //
            // The current logic does not try to associate "thing()" with a specific parent.  Instead
            // the API documentation will show duplicated entries for example1.thing() and example2.thing()./
            //
            // This could be improved in the future, but it requires a stable mechanism for choosing an associated parent.
            // For thoughts about this:  https://github.com/microsoft/rushstack/issues/1308
            this._processAstModule(astEntity.astModule, exportedName, parentApiItem);
            return;
        }
        // TODO: Figure out how to represent reexported AstImport objects.  Basically we need to introduce a new
        // ApiItem subclass for "export alias", similar to a type alias, but representing declarations of the
        // form "export { X } from 'external-package'".  We can also use this to solve GitHub issue #950.
    }
    _processAstModule(astModule, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astModule.moduleSymbol.name;
        const containerKey = api_extractor_model_1.ApiNamespace.getContainerKey(name);
        let apiNamespace = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiNamespace === undefined) {
            apiNamespace = new api_extractor_model_1.ApiNamespace({
                name,
                docComment: undefined,
                releaseTag: api_extractor_model_1.ReleaseTag.None,
                excerptTokens: []
            });
            parentApiItem.addMember(apiNamespace);
        }
        astModule.astModuleExportInfo.exportedLocalEntities.forEach((exportedEntity, exportedName) => {
            this._processAstEntity(exportedEntity, exportedName, apiNamespace);
        });
    }
    _processDeclaration(astDeclaration, exportedName, parentApiItem) {
        if ((astDeclaration.modifierFlags & ts.ModifierFlags.Private) !== 0) {
            return; // trim out private declarations
        }
        const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
        const releaseTag = apiItemMetadata.effectiveReleaseTag;
        if (releaseTag === api_extractor_model_1.ReleaseTag.Internal || releaseTag === api_extractor_model_1.ReleaseTag.Alpha) {
            return; // trim out items marked as "@internal" or "@alpha"
        }
        switch (astDeclaration.declaration.kind) {
            case ts.SyntaxKind.CallSignature:
                this._processApiCallSignature(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.Constructor:
                this._processApiConstructor(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.ConstructSignature:
                this._processApiConstructSignature(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.ClassDeclaration:
                this._processApiClass(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.EnumDeclaration:
                this._processApiEnum(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.EnumMember:
                this._processApiEnumMember(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.FunctionDeclaration:
                this._processApiFunction(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.GetAccessor:
                this._processApiProperty(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.SetAccessor:
                this._processApiProperty(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.IndexSignature:
                this._processApiIndexSignature(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.InterfaceDeclaration:
                this._processApiInterface(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.MethodDeclaration:
                this._processApiMethod(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.MethodSignature:
                this._processApiMethodSignature(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.ModuleDeclaration:
                this._processApiNamespace(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.PropertyDeclaration:
                this._processApiProperty(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.PropertySignature:
                this._processApiPropertySignature(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.TypeAliasDeclaration:
                this._processApiTypeAlias(astDeclaration, exportedName, parentApiItem);
                break;
            case ts.SyntaxKind.VariableDeclaration:
                this._processApiVariable(astDeclaration, exportedName, parentApiItem);
                break;
            default:
            // ignore unknown types
        }
    }
    _processChildDeclarations(astDeclaration, exportedName, parentApiItem) {
        for (const childDeclaration of astDeclaration.children) {
            this._processDeclaration(childDeclaration, undefined, parentApiItem);
        }
    }
    _processApiCallSignature(astDeclaration, exportedName, parentApiItem) {
        const overloadIndex = this._collector.getOverloadIndex(astDeclaration);
        const containerKey = api_extractor_model_1.ApiCallSignature.getContainerKey(overloadIndex);
        let apiCallSignature = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiCallSignature === undefined) {
            const callSignature = astDeclaration.declaration;
            const nodesToCapture = [];
            const returnTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: callSignature.type, tokenRange: returnTypeTokenRange });
            const typeParameters = this._captureTypeParameters(nodesToCapture, callSignature.typeParameters);
            const parameters = this._captureParameters(nodesToCapture, callSignature.parameters);
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiCallSignature = new api_extractor_model_1.ApiCallSignature({
                docComment,
                releaseTag,
                typeParameters,
                parameters,
                overloadIndex,
                excerptTokens,
                returnTypeTokenRange
            });
            parentApiItem.addMember(apiCallSignature);
        }
    }
    _processApiConstructor(astDeclaration, exportedName, parentApiItem) {
        const overloadIndex = this._collector.getOverloadIndex(astDeclaration);
        const containerKey = api_extractor_model_1.ApiConstructor.getContainerKey(overloadIndex);
        let apiConstructor = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiConstructor === undefined) {
            const constructorDeclaration = astDeclaration.declaration;
            const nodesToCapture = [];
            const parameters = this._captureParameters(nodesToCapture, constructorDeclaration.parameters);
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            const isProtected = (astDeclaration.modifierFlags & ts.ModifierFlags.Protected) !== 0;
            apiConstructor = new api_extractor_model_1.ApiConstructor({
                docComment,
                releaseTag,
                isProtected,
                parameters,
                overloadIndex,
                excerptTokens
            });
            parentApiItem.addMember(apiConstructor);
        }
    }
    _processApiClass(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiClass.getContainerKey(name);
        let apiClass = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiClass === undefined) {
            const classDeclaration = astDeclaration.declaration;
            const nodesToCapture = [];
            const typeParameters = this._captureTypeParameters(nodesToCapture, classDeclaration.typeParameters);
            let extendsTokenRange = undefined;
            const implementsTokenRanges = [];
            for (const heritageClause of classDeclaration.heritageClauses || []) {
                if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                    extendsTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
                    if (heritageClause.types.length > 0) {
                        nodesToCapture.push({ node: heritageClause.types[0], tokenRange: extendsTokenRange });
                    }
                }
                else if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
                    for (const heritageType of heritageClause.types) {
                        const implementsTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
                        implementsTokenRanges.push(implementsTokenRange);
                        nodesToCapture.push({ node: heritageType, tokenRange: implementsTokenRange });
                    }
                }
            }
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiClass = new api_extractor_model_1.ApiClass({
                name,
                docComment,
                releaseTag,
                excerptTokens,
                typeParameters,
                extendsTokenRange,
                implementsTokenRanges
            });
            parentApiItem.addMember(apiClass);
        }
        this._processChildDeclarations(astDeclaration, exportedName, apiClass);
    }
    _processApiConstructSignature(astDeclaration, exportedName, parentApiItem) {
        const overloadIndex = this._collector.getOverloadIndex(astDeclaration);
        const containerKey = api_extractor_model_1.ApiConstructSignature.getContainerKey(overloadIndex);
        let apiConstructSignature = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiConstructSignature === undefined) {
            const constructSignature = astDeclaration.declaration;
            const nodesToCapture = [];
            const returnTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: constructSignature.type, tokenRange: returnTypeTokenRange });
            const typeParameters = this._captureTypeParameters(nodesToCapture, constructSignature.typeParameters);
            const parameters = this._captureParameters(nodesToCapture, constructSignature.parameters);
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiConstructSignature = new api_extractor_model_1.ApiConstructSignature({
                docComment,
                releaseTag,
                typeParameters,
                parameters,
                overloadIndex,
                excerptTokens,
                returnTypeTokenRange
            });
            parentApiItem.addMember(apiConstructSignature);
        }
    }
    _processApiEnum(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiEnum.getContainerKey(name);
        let apiEnum = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiEnum === undefined) {
            const excerptTokens = this._buildExcerptTokens(astDeclaration, []);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiEnum = new api_extractor_model_1.ApiEnum({ name, docComment, releaseTag, excerptTokens });
            parentApiItem.addMember(apiEnum);
        }
        this._processChildDeclarations(astDeclaration, exportedName, apiEnum);
    }
    _processApiEnumMember(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiEnumMember.getContainerKey(name);
        let apiEnumMember = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiEnumMember === undefined) {
            const enumMember = astDeclaration.declaration;
            const nodesToCapture = [];
            const initializerTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: enumMember.initializer, tokenRange: initializerTokenRange });
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiEnumMember = new api_extractor_model_1.ApiEnumMember({
                name,
                docComment,
                releaseTag,
                excerptTokens,
                initializerTokenRange
            });
            parentApiItem.addMember(apiEnumMember);
        }
    }
    _processApiFunction(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const overloadIndex = this._collector.getOverloadIndex(astDeclaration);
        const containerKey = api_extractor_model_1.ApiFunction.getContainerKey(name, overloadIndex);
        let apiFunction = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiFunction === undefined) {
            const functionDeclaration = astDeclaration.declaration;
            const nodesToCapture = [];
            const returnTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: functionDeclaration.type, tokenRange: returnTypeTokenRange });
            const typeParameters = this._captureTypeParameters(nodesToCapture, functionDeclaration.typeParameters);
            const parameters = this._captureParameters(nodesToCapture, functionDeclaration.parameters);
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            if (releaseTag === api_extractor_model_1.ReleaseTag.Internal || releaseTag === api_extractor_model_1.ReleaseTag.Alpha) {
                return; // trim out items marked as "@internal" or "@alpha"
            }
            apiFunction = new api_extractor_model_1.ApiFunction({
                name,
                docComment,
                releaseTag,
                typeParameters,
                parameters,
                overloadIndex,
                excerptTokens,
                returnTypeTokenRange
            });
            parentApiItem.addMember(apiFunction);
        }
    }
    _processApiIndexSignature(astDeclaration, exportedName, parentApiItem) {
        const overloadIndex = this._collector.getOverloadIndex(astDeclaration);
        const containerKey = api_extractor_model_1.ApiIndexSignature.getContainerKey(overloadIndex);
        let apiIndexSignature = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiIndexSignature === undefined) {
            const indexSignature = astDeclaration.declaration;
            const nodesToCapture = [];
            const returnTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: indexSignature.type, tokenRange: returnTypeTokenRange });
            const parameters = this._captureParameters(nodesToCapture, indexSignature.parameters);
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiIndexSignature = new api_extractor_model_1.ApiIndexSignature({
                docComment,
                releaseTag,
                parameters,
                overloadIndex,
                excerptTokens,
                returnTypeTokenRange
            });
            parentApiItem.addMember(apiIndexSignature);
        }
    }
    _processApiInterface(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiInterface.getContainerKey(name);
        let apiInterface = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiInterface === undefined) {
            const interfaceDeclaration = astDeclaration.declaration;
            const nodesToCapture = [];
            const typeParameters = this._captureTypeParameters(nodesToCapture, interfaceDeclaration.typeParameters);
            const extendsTokenRanges = [];
            for (const heritageClause of interfaceDeclaration.heritageClauses || []) {
                if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
                    for (const heritageType of heritageClause.types) {
                        const extendsTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
                        extendsTokenRanges.push(extendsTokenRange);
                        nodesToCapture.push({ node: heritageType, tokenRange: extendsTokenRange });
                    }
                }
            }
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiInterface = new api_extractor_model_1.ApiInterface({
                name,
                docComment,
                releaseTag,
                excerptTokens,
                typeParameters,
                extendsTokenRanges
            });
            parentApiItem.addMember(apiInterface);
        }
        this._processChildDeclarations(astDeclaration, exportedName, apiInterface);
    }
    _processApiMethod(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const isStatic = (astDeclaration.modifierFlags & ts.ModifierFlags.Static) !== 0;
        const overloadIndex = this._collector.getOverloadIndex(astDeclaration);
        const containerKey = api_extractor_model_1.ApiMethod.getContainerKey(name, isStatic, overloadIndex);
        let apiMethod = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiMethod === undefined) {
            const methodDeclaration = astDeclaration.declaration;
            const nodesToCapture = [];
            const returnTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: methodDeclaration.type, tokenRange: returnTypeTokenRange });
            const typeParameters = this._captureTypeParameters(nodesToCapture, methodDeclaration.typeParameters);
            const parameters = this._captureParameters(nodesToCapture, methodDeclaration.parameters);
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            if (releaseTag === api_extractor_model_1.ReleaseTag.Internal || releaseTag === api_extractor_model_1.ReleaseTag.Alpha) {
                return; // trim out items marked as "@internal" or "@alpha"
            }
            const isOptional = (astDeclaration.astSymbol.followedSymbol.flags & ts.SymbolFlags.Optional) !== 0;
            const isProtected = (astDeclaration.modifierFlags & ts.ModifierFlags.Protected) !== 0;
            apiMethod = new api_extractor_model_1.ApiMethod({
                name,
                docComment,
                releaseTag,
                isProtected,
                isStatic,
                isOptional,
                typeParameters,
                parameters,
                overloadIndex,
                excerptTokens,
                returnTypeTokenRange
            });
            parentApiItem.addMember(apiMethod);
        }
    }
    _processApiMethodSignature(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const overloadIndex = this._collector.getOverloadIndex(astDeclaration);
        const containerKey = api_extractor_model_1.ApiMethodSignature.getContainerKey(name, overloadIndex);
        let apiMethodSignature = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiMethodSignature === undefined) {
            const methodSignature = astDeclaration.declaration;
            const nodesToCapture = [];
            const returnTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: methodSignature.type, tokenRange: returnTypeTokenRange });
            const typeParameters = this._captureTypeParameters(nodesToCapture, methodSignature.typeParameters);
            const parameters = this._captureParameters(nodesToCapture, methodSignature.parameters);
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            const isOptional = (astDeclaration.astSymbol.followedSymbol.flags & ts.SymbolFlags.Optional) !== 0;
            apiMethodSignature = new api_extractor_model_1.ApiMethodSignature({
                name,
                docComment,
                releaseTag,
                isOptional,
                typeParameters,
                parameters,
                overloadIndex,
                excerptTokens,
                returnTypeTokenRange
            });
            parentApiItem.addMember(apiMethodSignature);
        }
    }
    _processApiNamespace(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiNamespace.getContainerKey(name);
        let apiNamespace = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiNamespace === undefined) {
            const excerptTokens = this._buildExcerptTokens(astDeclaration, []);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiNamespace = new api_extractor_model_1.ApiNamespace({ name, docComment, releaseTag, excerptTokens });
            parentApiItem.addMember(apiNamespace);
        }
        this._processChildDeclarations(astDeclaration, exportedName, apiNamespace);
    }
    _processApiProperty(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const isStatic = (astDeclaration.modifierFlags & ts.ModifierFlags.Static) !== 0;
        const containerKey = api_extractor_model_1.ApiProperty.getContainerKey(name, isStatic);
        let apiProperty = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiProperty === undefined) {
            const nodesToCapture = [];
            const propertyTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            let propertyTypeNode;
            if (ts.isPropertyDeclaration(astDeclaration.declaration) ||
                ts.isGetAccessorDeclaration(astDeclaration.declaration)) {
                propertyTypeNode = astDeclaration.declaration.type;
            }
            if (ts.isSetAccessorDeclaration(astDeclaration.declaration)) {
                // Note that TypeScript always reports an error if a setter does not have exactly one parameter.
                propertyTypeNode = astDeclaration.declaration.parameters[0].type;
            }
            nodesToCapture.push({ node: propertyTypeNode, tokenRange: propertyTypeTokenRange });
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            const isOptional = (astDeclaration.astSymbol.followedSymbol.flags & ts.SymbolFlags.Optional) !== 0;
            const isProtected = (astDeclaration.modifierFlags & ts.ModifierFlags.Protected) !== 0;
            const isReadonly = this._determineReadonly(astDeclaration);
            apiProperty = new api_extractor_model_1.ApiProperty({
                name,
                docComment,
                releaseTag,
                isProtected,
                isStatic,
                isOptional,
                isReadonly,
                excerptTokens,
                propertyTypeTokenRange
            });
            parentApiItem.addMember(apiProperty);
        }
        else {
            // If the property was already declared before (via a merged interface declaration),
            // we assume its signature is identical, because the language requires that.
        }
    }
    _processApiPropertySignature(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiPropertySignature.getContainerKey(name);
        let apiPropertySignature = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiPropertySignature === undefined) {
            const propertySignature = astDeclaration.declaration;
            const nodesToCapture = [];
            const propertyTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: propertySignature.type, tokenRange: propertyTypeTokenRange });
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            const isOptional = (astDeclaration.astSymbol.followedSymbol.flags & ts.SymbolFlags.Optional) !== 0;
            const isReadonly = this._determineReadonly(astDeclaration);
            apiPropertySignature = new api_extractor_model_1.ApiPropertySignature({
                name,
                docComment,
                releaseTag,
                isOptional,
                excerptTokens,
                propertyTypeTokenRange,
                isReadonly
            });
            parentApiItem.addMember(apiPropertySignature);
        }
        else {
            // If the property was already declared before (via a merged interface declaration),
            // we assume its signature is identical, because the language requires that.
        }
    }
    _processApiTypeAlias(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiTypeAlias.getContainerKey(name);
        let apiTypeAlias = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiTypeAlias === undefined) {
            const typeAliasDeclaration = astDeclaration.declaration;
            const nodesToCapture = [];
            const typeParameters = this._captureTypeParameters(nodesToCapture, typeAliasDeclaration.typeParameters);
            const typeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: typeAliasDeclaration.type, tokenRange: typeTokenRange });
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            apiTypeAlias = new api_extractor_model_1.ApiTypeAlias({
                name,
                docComment,
                typeParameters,
                releaseTag,
                excerptTokens,
                typeTokenRange
            });
            parentApiItem.addMember(apiTypeAlias);
        }
    }
    _processApiVariable(astDeclaration, exportedName, parentApiItem) {
        const name = exportedName ? exportedName : astDeclaration.astSymbol.localName;
        const containerKey = api_extractor_model_1.ApiVariable.getContainerKey(name);
        let apiVariable = parentApiItem.tryGetMemberByKey(containerKey);
        if (apiVariable === undefined) {
            const variableDeclaration = astDeclaration.declaration;
            const nodesToCapture = [];
            const variableTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: variableDeclaration.type, tokenRange: variableTypeTokenRange });
            const excerptTokens = this._buildExcerptTokens(astDeclaration, nodesToCapture);
            const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
            const docComment = apiItemMetadata.tsdocComment;
            const releaseTag = apiItemMetadata.effectiveReleaseTag;
            const isReadonly = this._determineReadonly(astDeclaration);
            apiVariable = new api_extractor_model_1.ApiVariable({
                name,
                docComment,
                releaseTag,
                excerptTokens,
                variableTypeTokenRange,
                isReadonly
            });
            parentApiItem.addMember(apiVariable);
        }
    }
    /**
     * @param nodesToCapture - A list of child nodes whose token ranges we want to capture
     */
    _buildExcerptTokens(astDeclaration, nodesToCapture) {
        const excerptTokens = [];
        // Build the main declaration
        ExcerptBuilder_1.ExcerptBuilder.addDeclaration(excerptTokens, astDeclaration, nodesToCapture, this._referenceGenerator);
        const declarationMetadata = this._collector.fetchDeclarationMetadata(astDeclaration);
        // Add any ancillary declarations
        for (const ancillaryDeclaration of declarationMetadata.ancillaryDeclarations) {
            ExcerptBuilder_1.ExcerptBuilder.addBlankLine(excerptTokens);
            ExcerptBuilder_1.ExcerptBuilder.addDeclaration(excerptTokens, ancillaryDeclaration, nodesToCapture, this._referenceGenerator);
        }
        return excerptTokens;
    }
    _captureTypeParameters(nodesToCapture, typeParameterNodes) {
        const typeParameters = [];
        if (typeParameterNodes) {
            for (const typeParameter of typeParameterNodes) {
                const constraintTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
                nodesToCapture.push({ node: typeParameter.constraint, tokenRange: constraintTokenRange });
                const defaultTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
                nodesToCapture.push({ node: typeParameter.default, tokenRange: defaultTypeTokenRange });
                typeParameters.push({
                    typeParameterName: typeParameter.name.getText().trim(),
                    constraintTokenRange,
                    defaultTypeTokenRange
                });
            }
        }
        return typeParameters;
    }
    _captureParameters(nodesToCapture, parameterNodes) {
        const parameters = [];
        for (const parameter of parameterNodes) {
            const parameterTypeTokenRange = ExcerptBuilder_1.ExcerptBuilder.createEmptyTokenRange();
            nodesToCapture.push({ node: parameter.type, tokenRange: parameterTypeTokenRange });
            parameters.push({
                parameterName: parameter.name.getText().trim(),
                parameterTypeTokenRange,
                isOptional: this._collector.typeChecker.isOptionalParameter(parameter)
            });
        }
        return parameters;
    }
    _determineReadonly(astDeclaration) {
        const apiItemMetadata = this._collector.fetchApiItemMetadata(astDeclaration);
        const docComment = apiItemMetadata.tsdocComment;
        const declarationMetadata = this._collector.fetchDeclarationMetadata(astDeclaration);
        //Line 1: sees whether the readonly or const modifiers are present
        //Line 2: sees if the TSDoc comment for @readonly is present
        //Line 3: sees whether a getter is present for a property with no setter
        //Line 4: sees if the var declaration has Const keyword
        return ((astDeclaration.modifierFlags & (ts.ModifierFlags.Readonly + ts.ModifierFlags.Const)) !== 0 ||
            (docComment !== undefined && docComment.modifierTagSet.hasTagName('@readonly')) ||
            (declarationMetadata.ancillaryDeclarations.length === 0 &&
                astDeclaration.declaration.kind === ts.SyntaxKind.GetAccessor) ||
            (ts.isVariableDeclaration(astDeclaration.declaration) &&
                TypeScriptInternals_1.TypeScriptInternals.isVarConst(astDeclaration.declaration)));
    }
}
exports.ApiModelGenerator = ApiModelGenerator;
//# sourceMappingURL=ApiModelGenerator.js.map