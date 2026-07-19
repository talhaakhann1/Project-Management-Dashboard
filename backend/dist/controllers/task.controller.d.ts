export declare const commonTaskAggregationStages: ({
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        pipeline: {
            $project: {
                _id: number;
                id: {
                    $toString: string;
                };
                fullName: number;
                avatar: number;
            };
        }[];
    };
    $unwind?: never;
    $project?: never;
} | {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        pipeline: {
            $project: {
                _id: number;
                id: {
                    $toString: string;
                };
                name: number;
            };
        }[];
    };
    $unwind?: never;
    $project?: never;
} | {
    $unwind: {
        path: string;
        preserveNullAndEmptyArrays: boolean;
    };
    $lookup?: never;
    $project?: never;
} | {
    $project: {
        id: {
            $toString: string;
        };
        _id: number;
        title: number;
        description: number;
        status: number;
        project: number;
        priority: number;
        assignees: {
            $map: {
                input: string;
                as: string;
                in: {
                    id: string;
                    fullName: string;
                    avatar: string;
                };
            };
        };
        dueDate: number;
        createdAt: number;
        updatedAt: number;
    };
    $lookup?: never;
    $unwind?: never;
})[];
export declare const createTask: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const deleteTaskById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const updateTaskDetails: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getAllProjectTasks: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getAllTasks: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const changeTaskStatus: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getTaskById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=task.controller.d.ts.map