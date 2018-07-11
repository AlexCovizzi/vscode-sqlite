import { readFileSync } from "fs";
import { dirname, join } from "path";
import { Uri } from "vscode";
import { sanitizeStringForHtml } from "../utils/utils";

interface Cache {
    [tplPath: string]: string;
}

interface TplContext {
    [obj: string]: any;
}

export class TemplateEngine {
    private openTag = '<%';
    private closeTag = '%>';
    private openValTag = `<%=`;
    private closeValTag = `%>`;
    private resourceScheme = 'vscode-resource';

    private valTagRegexStr = `${this.openValTag}([^${this.closeValTag}]+)?${this.closeValTag}`;
    private tagRegexStr = `${this.openTag}([^${this.closeTag}]+)?${this.closeTag}`;
    private tagRegex = new RegExp(`(?:${this.valTagRegexStr}|${this.tagRegexStr})`, "g");

    private cache: Cache;

    constructor() {
        this.cache = {};
    }

    process(tplPath: string, context: TplContext): string {
        let tpl = "";
        try {
            tpl = this.readWithCache(tplPath);
        } catch(err) {
            throw new Error(`Unable to read file "${tplPath}"`);
        }
        
        let stack = new TplStack(tplPath);
        let cursor = 0;
        let regExecArray;
        while (regExecArray = this.tagRegex.exec(tpl)) {
            // push string untill the matched string
            stack.pushStr(tpl.slice(cursor, regExecArray.index));

            let match: string = regExecArray[0];
            let capture: string = regExecArray[1]? regExecArray[1] : regExecArray[2];
            
            if (match.startsWith(this.openValTag)) {
                stack.pushVal(capture);
            } else {
                stack.pushJs(capture);
            }

            cursor = regExecArray.index + match.length;
        }
        // push last string of the html
        stack.pushStr(tpl.substr(cursor, tpl.length - cursor));
        
        context['_engine'] = this;
        return stack.execute(context);
    }

    _tpl_css(str: string, rootPath: string) {
        let path = this._tpl_resource(str, rootPath);
        return `<link rel="stylesheet" href="${path}">`;
    }

    _tpl_js(str: string, rootPath: string) {
        let path = this._tpl_resource(str, rootPath);
        return `<script src="${path}">`;
    }

    _tpl_resource(str: string, rootPath: string) {
        let path = join(rootPath, str);
        path = Uri.parse(path).with({scheme: this.resourceScheme}).toString();
        return path;
    }

    _tpl_html(str: string, rootPath: string, ctx: TplContext) {
        let path = join(rootPath, str);
        return this.process(path, ctx);
    }

    _tpl_sanitize(value: any) {
        if (typeof value === 'string') {
            return sanitizeStringForHtml(value);
        } else {
            return value;
        }
    }

    private readWithCache(tplPath: string) {
        let tpl: string = '';
        if (tplPath in this.cache) {
            tpl = this.cache[tplPath];
        } else {
            tpl = readFileSync(tplPath, 'utf8');
            this.cache[tplPath] = tpl;
        }
        return tpl;
    }
}

class TplStack {
    private rootPath: string;
    private stack: string[];

    constructor(tplPath: string) {
        this.rootPath = dirname(tplPath);
        // replace backslash with double backslash for windows
        this.rootPath = this.rootPath.replace(/\\/g, '\\\\');
        
        this.stack = [];

        this.pushJs(`let self = this;`);

        // push css and js functions
        this.pushJs(
        `function css(str) {
            return self._engine._tpl_css(str, '${this.rootPath}');
        }`);
        this.pushJs(
        `function js(str) {
            return self._engine._tpl_js(str, '${this.rootPath}');
        }`);
        this.pushJs(
        `function res(str) {
            return self._engine._tpl_resource(str, '${this.rootPath}');
        }`);
        this.pushJs(
        `function html(str, ctx) {
            return self._engine.process('${this.rootPath}/'+str, ctx);
        }`);

        this.pushJs('let _s = [];');
    }

    pushJs(str: string) {
        this.stack.push(`${str}`);
    }

    pushVal(str: string) {
        if (str.indexOf('(') > 0) {
            // the string is a method invocation, we push it like that
            this.stack.push(`_s.push(${str});`);
        } else {
            // the string is a value, we need to sanitize it
            this.stack.push(`_s.push(self._engine._tpl_sanitize(${str}));`);
        }
    }

    pushStr(str: string) {
        this.stack.push(`_s.push(\`${str}\`);`);
    }

    execute(ctx: TplContext) {
        this.pushJs('return _s.join("");');
        let code = this.stack.join('\n');
        
        return new Function(code).apply(ctx);
    }
}