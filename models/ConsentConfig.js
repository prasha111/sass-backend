// models/ConsentConfig.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const consentConfigSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    bannerText: { type: String, default: "We use cookies to improve your experience." },
    version: { type: Number, default: 1 },
    categories: {
      necessary: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      preferences: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsentConfig", consentConfigSchema);