// models/Site.js
import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      default: "Global",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Healthy", "Warning"],
      default: "Healthy",
    },
    banner: {
      type: String,
      enum: ["Draft", "Active"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

const Site = mongoose.model("Site", siteSchema);
export default Site;