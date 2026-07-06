import mongoose, { Document, Types, Model, Schema } from "mongoose";
import type { IProject } from "../interfaces/project.interface.js";
import { ProjectStatus } from "../types/enums/project.enum.js";
import { AvailableProjectColour } from "../types/enums/project.enum.js";

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
    thumbnail:{
        type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
    },
    status: {
      type: String,
      enum: ProjectStatus,
      default: ProjectStatus.ACTIVE,
      required: true,
    },
    colour: {
      type: String,
      enum:AvailableProjectColour,
      default:AvailableProjectColour.BLUE,
      required: true
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
