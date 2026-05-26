const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    cookieCount: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
    },
  },
  { timestamps: true } // optional createdAt/updatedAt
);

module.exports = mongoose.model("Scan", scanSchema);