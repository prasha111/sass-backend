// models/Cookie.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const cookieSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    scanId: { type: Schema.Types.ObjectId, ref: "Scan", required: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    path: { type: String, default: "/" },
    expires: { type: Date },
    category: {
      type: String,
      enum: ["necessary", "analytics", "marketing", "preferences", "unknown"],
      default: "unknown"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cookie", cookieSchema);