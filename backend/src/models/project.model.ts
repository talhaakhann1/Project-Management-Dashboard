import mongoose, { Document, Types, Model, Schema } from "mongoose";
import type { IProject } from "../interfaces/project.interface.js";
import { ProjectStatus } from "../types/enums/project.enum.js";

export const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ProjectStatus,
      default: ProjectStatus.ACTIVE,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    colour: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const Project: Model<IProject> = mongoose.model<IProject>(
  "Project",
  projectSchema,
);
