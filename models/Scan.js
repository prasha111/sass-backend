// models/Scan.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const scanSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    pageUrl: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },
    scannedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);