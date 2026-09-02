import mongoose, { Document, Types, Model, Schema } from "mongoose";
import type { ITask } from "../interfaces/task.interface.js";

export const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

taskSchema.index({ projectId: 1 });
taskSchema.index({ assignees: 1, dueDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });

export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
