import mongoose, { Types, Model } from "mongoose";
import type { IProject } from "../interfaces/project.interface.js";
import { ProjectStatus } from "../types/enums/project.enum.js";
export declare const projectSchema: mongoose.Schema<IProject, mongoose.Model<IProject, any, any, any, any, any, IProject>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IProject, mongoose.Document<unknown, {}, IProject, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: mongoose.SchemaDefinitionProperty<Types.ObjectId, IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    description?: mongoose.SchemaDefinitionProperty<string, IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    name?: mongoose.SchemaDefinitionProperty<string, IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    status?: mongoose.SchemaDefinitionProperty<ProjectStatus, IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    dueDate?: mongoose.SchemaDefinitionProperty<Date, IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    colour?: mongoose.SchemaDefinitionProperty<string, IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdBy?: mongoose.SchemaDefinitionProperty<Types.ObjectId, IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    members?: mongoose.SchemaDefinitionProperty<Types.ObjectId[], IProject, mongoose.Document<unknown, {}, IProject, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IProject & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, IProject>;
export declare const Project: Model<IProject>;
//# sourceMappingURL=project.model.d.ts.map