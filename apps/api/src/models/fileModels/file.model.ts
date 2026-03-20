import mongoose, { model, Document, Schema } from 'mongoose';
// This interface can also be used for typecasting in services
export interface FileSchema {
  userId: string;
  itemName: string;
  size: number;
  mimeType: string;
  key: string;
  fileUrl?: string;
  parentFolder: String;
}

// Defining the db schema
const FilesSchema = new Schema<FileSchema>(
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

    itemName: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true, // important (each file in S3 has unique key)
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

const Files = model<FileSchema>('Files', FilesSchema);

export default Files;
