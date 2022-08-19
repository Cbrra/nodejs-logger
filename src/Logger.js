// @ts-check
const { lstatSync, renameSync, createWriteStream } = require("node:fs");
const { sep } = require("node:path");
const moment = require("moment");
const chalk = require("chalk");
const LogType = require("./LogType");

class Logger {
    constructor(options) {
        this.options = Object.assign({
            showAll: false,
            utcOffset: 0,
            dateFormat: "DD-MM HH:mm:ss.SSS",
            maxMainCacheLength: 250,
            maxCacheLength: 250,
            mainCacheSliceWidth: 100,
            cacheSliceWidth: 100
        }, options);

        if(typeof this.options.path !== "string") throw new TypeError("options.path must be a string");
        if(this.options.mainCacheSliceWidth > this.options.maxMainCacheLength) throw new RangeError("maxMainCacheLength must be superior than mainCacheSliceWidth");
        if(this.options.cacheSliceWidth > this.options.maxCacheLength) throw new RangeError("maxCacheLength must be superior than cacheSliceWidth");

        try {
            if(lstatSync(this.options.path)) renameSync(this.options.path, `old_${this.options.path}`);
        } catch(e) {};

        this.stream = createWriteStream(this.options.path, { flags: "w" });
        this.cache = {
            all: [],
            debugs: { All: [], },
            logs: { All: [] },
            warns: { All: [] },
            errors: { All: [] }
        };
    };

    now() {
        return moment(Date.now()).utcOffset(this.options.utcOffset).format(this.options.dateFormat);
    };

    debug(type, filename, ...messages) {
        this._log(LogType.Debug, "debugs", type, filename, messages);
    };

    log(type, filename, ...messages) {
        this._log(LogType.Log, "logs", type, filename, messages);
    };

    info(type, filename, ...messages) {
        this._log(LogType.Info, "logs", type, filename, messages);
    };

    success(type, filename, ...messages) {
        this._log(LogType.Success, "logs", type, filename, messages);
    };

    warn(type, filename, ...messages) {
        this._log(LogType.Warn, "warns", type, filename, messages);
    };

    error(type, filename, ...messages) {
        this._log(LogType.Error, "errors", type, filename, messages);
    };

    _log(logType, cacheKey, type, filename, messages) {
        const date = this.now();

        if(!messages?.length) return console.trace(`[${date}] [InvalidLogProvided] ${type}`);
        filename = filename.split(sep).at(-1);

        const isError = logType === LogType.Error;
        const isAnormal = logType === LogType.Warn || isError;

        const data = {
            date,
            type,
            filename,
            messages
        };

        const coloredMessage = Logger.format(logType, data, true);
        const uncoloredMessage = Logger.format(logType, data, false);

        if(isAnormal || this.options.showAll || !type.toLowerCase().startsWith("invisible")) {
            if(isAnormal) console.error(coloredMessage);
            else console.log(coloredMessage);
        };

        this.stream.write(`${uncoloredMessage}\n`);

        const cache = this.cache[cacheKey];
        if(!cache[type]) cache[type] = [];

        this.cache.all.push(data);
        cache.All.push(data);
        cache[type].push(data);

        if(this.cache.all.length > this.options.maxMainCacheLength) this.cache.all = this.cache.all.slice(this.options.mainCacheSliceWidth);
        if(cache.All.length > this.options.maxMainCacheLength) cache.All = cache.All.slice(this.options.mainCacheSliceWidth);
        if(cache[type].length > this.options.maxCacheLength) cache[type] = cache[type].slice(this.options.cacheSliceWidth);
    };

    static format(logType, data, colored) {
        const message = (logType === LogType.Warn || logType === LogType.Error) ? data.messages.map(e => e instanceof Error ? `\n${e.stack}` : e).join(" ") : data.messages.join(" ");
        if(!colored) return `${data.date} - ${Logger.prefixes[logType]} [${data.type}] [${data.filename}] ${message}`;

        const color = Logger.colors[logType];
        return `${data.date} - ${color(Logger.prefixes[logType])} [${color(data.type)}] [${color(data.filename)}] ${color(message)}`;
    };

    static colors = {
        [LogType.Debug]: chalk.magentaBright,
        [LogType.Log]: chalk.rgb(37, 148, 233),
        [LogType.Info]: chalk.rgb(7, 141, 49),
        [LogType.Success]: chalk.greenBright,
        [LogType.Warn]: chalk.rgb(255, 152, 56),
        [LogType.Error]: chalk.rgb(228, 17, 17)
    };

    static prefixes = {
        [LogType.Debug]: "debug   -",
        [LogType.Log]: "log     -",
        [LogType.Info]: "info    -",
        [LogType.Success]: "success -",
        [LogType.Warn]: "warn    -",
        [LogType.Error]: "error   -"
    };
};

module.exports = Logger;
