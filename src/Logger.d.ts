import { Chalk } from "chalk";
import LogType from "./LogType";

type CacheKey = "debugs" | "logs" | "warns" | "errors";

interface ILog {
    date: string;
    type: string;
    filename: string;
    messages: (string | Error)[];
}

interface IOptions {
    path: string;
    showAll?: boolean;
    utcOffset?: number;
    dateFormat?: string;
    maxMainCacheLength?: number;
    maxCacheLength?: number;
    mainCacheSliceWidth?: number;
    cacheSliceWidth?: number;
}

declare class Logger {
    public constructor(options: IOptions);
    public readonly options: Required<IOptions>;
    public readonly stream: NodeJS.WriteStream;
    public readonly cache: { all: ILog[] } & {
        [key in CacheKey]: {
            All: ILog[];
            [key: string]: ILog[];
        };
    };
    public now(): string;
    public debug(type: string, filename: string, ...messages: string[]): void;
    public log(type: string, filename: string, ...messages: string[]): void;
    public info(type: string, filename: string, ...messages: string[]): void;
    public success(type: string, filename: string, ...messages: string[]): void;
    public warn(type: string, filename: string, ...messages: (string | Error)[]): void;
    public error(type: string, filename: string, ...messages: (string | Error)[]): void;
    private _log(logType: LogType, cacheKey: string, type: string, filename: string, ...messages: (string | Error)[]): void;
    public static format(logType: LogType, data: ILog, colored: boolean): string;
    public static readonly colors: {
        [key in LogType]: Chalk;
    };
    public static readonly prefixes: {
        [key in LogType]: string;
    };
}

export = Logger;
