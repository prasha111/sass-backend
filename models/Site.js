// models/Site.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const siteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    domain: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Site", siteSchema);