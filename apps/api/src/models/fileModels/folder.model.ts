import mongoose, { model, Document, Schema } from 'mongoose';

// This interface can also be used for typecasting in services
export interface FolderSchema {
  userId: string;
  name: string;
  size: number;
  parentFolder?: string;
}

export interface FolderInput extends FolderSchema, Document {}

// Defining the db schema
const FoldersSchema = new Schema<FolderInput>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    parentFolder: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Folders = model<FolderInput>('Folders', FoldersSchema);

export default Folders;
