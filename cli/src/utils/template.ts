import * as ejs from 'ejs';
import { IBuildJson } from '../build';

/**
 * Place where you need to replace the variable
 * 
 * <%= projectUpperValue %>
   <%= projectValue %>
 */
export interface TemplateData {
    projectValue: string;
    projectUpperValue: string;
    projectName: string;
}

/**
 *
 * repalce value in content
 *
 * @param content
 * @param data
 * @returns
 */
export function render(content: string, data: TemplateData) {
    return ejs.render(content, data);
}

export function renderContent(content: string, data: IBuildJson) {
    return ejs.render(content, data);
}
