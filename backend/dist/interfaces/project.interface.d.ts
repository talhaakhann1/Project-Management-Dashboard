import { Document, Types } from "mongoose";
import { ProjectStatus } from "../types/enums/project.enum.js";
export interface IProject extends Document {
    name: string;
    description: string;
    status: ProjectStatus;
    dueDate: Date;
    colour: string;
    createdBy: Types.ObjectId;
    members: Types.ObjectId[];
}
//# sourceMappingURL=project.interface.d.ts.map