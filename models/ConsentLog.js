import mongoose from "mongoose";

const consentLogSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    banner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BannerConfig",
      required: true,
    },

    visitorId: {
      type: String, 
      required: true,
      index: true,
    },
    consent: {
      acceptedAt: {
        type: Date,
        default: Date.now,
      },

      choices: {
        type: Map,
        of: Boolean,
        default: {
          necessary: true,
          preferences: false,
          functional: false,
          analytics: false,
          marketing: false,
        },
      },
      action: {
        type: String,
        enum: ["accept_all", "reject_all", "custom"],
        default: "accept_all",
      },
    },
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ConsentLog", consentLogSchema);