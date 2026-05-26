import mongoose from "mongoose";

const regionRuleSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      trim: true,
      required: true,
    },
    countries: {
      type: [String],
      default: [],
    },
    autoShow: {
      type: Boolean,
      default: true,
    },
    showReject: {
      type: Boolean,
      default: true,
    },
    showCustomize: {
      type: Boolean,
      default: true,
    },
    requireOptIn: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 100,
    },
  },
  { _id: false }
);

const BannerConfigSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Your privacy",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      default:
        "We use cookies to enhance your browsing experience and analyze traffic.",
    },
    layout: {
      type: String,
      enum: ["bottom-bar", "modal"],
      default: "bottom-bar",
    },
    position: {
      type: String,
      enum: ["bottom", "top", "center"],
      default: "bottom",
    },
    themeColor: {
      type: String,
      default: "#0f766e",
    },
    textColor: {
      type: String,
      default: "#ffffff",
    },
    showReject: {
      type: Boolean,
      default: true,
    },
    showCustomize: {
      type: Boolean,
      default: true,
    },
    overlayEnabled: {
      type: Boolean,
      default: false,
    },
    regionScope: {
      type: String,
      default: "Global",
      trim: true,
    },
    regionRules: {
      type: [regionRuleSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BannerConfigSchema.index({ siteId: 1, version: -1 });
BannerConfigSchema.index({ siteId: 1, isActive: 1 });

const BannerConfig =
  mongoose.models.BannerConfig ||
  mongoose.model("BannerConfig", BannerConfigSchema);

export default BannerConfig;