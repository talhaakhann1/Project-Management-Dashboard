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
    priority:{
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
    createdBy:{
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
    ]
  },
  { timestamps: true },
);

export const Task: Model<ITask> = mongoose.model<ITask>(
  "Task",
  taskSchema,
);
