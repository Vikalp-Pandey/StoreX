import mongoose, { model, Document, Schema } from 'mongoose';
// This interface can also be used for typecasting in services
export interface shareItemSchema {
  fileId?: string;
  folderId?: string;
  userId: string; // This is destination user id to whom files/folders will be shared
  sharedBy: string; // The user who shared the item (sender/owner)
  permissions: string[];
}

// Defining the db schema
const shareItemsSchema = new Schema<shareItemSchema>(
  {
    fileId: {
      type: String,
      ref: 'Files',
      required: false,
    },

    folderId: {
      type: String,
      ref: 'Folders',
      required: false,
    },
    // This is destination user id to whom files/folders will be shared
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },

    sharedBy: {
      type: String,
      ref: 'User',
      required: true,
    },

    permissions: {
      type: [String],
      enum: ['read', 'create', 'delete'],
      required: true,
    },
  },
  { timestamps: true },
);

// Compound index to prevent duplicate shares
// Uses all three fields so that multiple files (folderId=null) can be shared to the same user
// shareItemsSchema.index({ userId: 1, fileId: 1, folderId: 1 }, { unique: true });

const sharedItem = model<shareItemSchema>('sharedItem', shareItemsSchema);

export default sharedItem;
