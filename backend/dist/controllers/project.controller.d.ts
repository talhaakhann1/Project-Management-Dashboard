export declare const commonProjectAggregationStages: ({
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
    $unwind: {
        path: string;
        preserveNullAndEmptyArrays: boolean;
    };
    $lookup?: never;
    $project?: never;
} | {
    $project: {
        _id: number;
        id: {
            $toString: string;
        };
        name: number;
        description: number;
        colour: number;
        members: {
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
        status: number;
        dueDate: number;
        createdBy: number;
    };
    $lookup?: never;
    $unwind?: never;
})[];
export declare const createProject: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getAllProjects: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const deleteProjectById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const updatedProjectDetails: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getProjectById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getAllAvailableProjects: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const changeProjectStatus: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=project.controller.d.ts.map