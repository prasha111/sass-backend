import mongoose from "mongoose";

const bannerConfigSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    version: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Your privacy",
    },
    body: {
      type: String,
      default:
        "We use cookies to enhance your browsing experience and serve interest‑based ads.",
    },
    categories: {
      type: [
        {
          key: String, // "necessary", "preferences", "functional", "analytics", "marketing"
          enabled: Boolean,
          label: String,
          description: String,
        },
      ],
      default: [
        {
          key: "necessary",
          enabled: true,
          label: "Necessary",
          description: "Always required for core site functionality.",
        },
        {
          key: "preferences",
          enabled: true,
          label: "Preferences",
          description: "Remembers site settings like language and theme.",
        },
        {
          key: "functional",
          enabled: true,
          label: "Functional",
          description: "Enhances usability, such as video players and forms.",
        },
        {
          key: "analytics",
          enabled: true,
          label: "Analytics",
          description: "Helps us understand how visitors use the site.",
        },
        {
          key: "marketing",
          enabled: true,
          label: "Marketing",
          description: "Supports targeted advertising and personalization.",
        },
      ],
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BannerConfig", bannerConfigSchema);