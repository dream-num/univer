import { DocumentModel } from '../Docs/Model/DocumentModel';
import { SpreadsheetModel } from '../Sheets/Model/SpreadsheetModel';
import { SlideModel } from '../Slides/Model';

export class CommandModel {
    SpreadsheetModel?: SpreadsheetModel;

    DocumentModel?: DocumentModel;

    SlideModel?: SlideModel;
}
