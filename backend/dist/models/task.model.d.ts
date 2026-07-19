import mongoose, { Types, Model } from "mongoose";
import type { ITask } from "../interfaces/task.interface.js";
export declare const taskSchema: mongoose.Schema<ITask, mongoose.Model<ITask, any, any, any, any, any, ITask>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITask, mongoose.Document<unknown, {}, ITask, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: mongoose.SchemaDefinitionProperty<Types.ObjectId, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    description?: mongoose.SchemaDefinitionProperty<string, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    title?: mongoose.SchemaDefinitionProperty<string, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    status?: mongoose.SchemaDefinitionProperty<string, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    dueDate?: mongoose.SchemaDefinitionProperty<Date, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdBy?: mongoose.SchemaDefinitionProperty<Types.ObjectId, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    priority?: mongoose.SchemaDefinitionProperty<string, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    projectId?: mongoose.SchemaDefinitionProperty<Types.ObjectId, ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    assignees?: mongoose.SchemaDefinitionProperty<Types.ObjectId[], ITask, mongoose.Document<unknown, {}, ITask, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ITask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, ITask>;
export declare const Task: Model<ITask>;
//# sourceMappingURL=task.model.d.ts.map