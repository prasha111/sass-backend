import express from "express";

const router = express.Router();

router.get("/banner.js", async (req, res) => {
  res.type("application/javascript").send(`
(function () {
  const currentScript = document.currentScript;
  if (!currentScript) return;

  const siteId =
    currentScript.getAttribute("data-site-id") ||
    new URL(currentScript.src).searchParams.get("siteId");

  const apiBase = new URL(currentScript.src).origin;

  if (!siteId) {
    console.error("Cookie banner: siteId is required");
    return;
  }

  const consentCookieName = "cc_consent";
  let cachedBanner = null;

  const defaultChoices = {
    necessary: true,
    preferences: false,
    functional: false,
    analytics: false,
    marketing: false,
  };

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const setCookie = (name, value, days = 365) => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie =
      name + "=" + encodeURIComponent(value) + "; path=/; max-age=" + maxAge;
  };

  const removeCookie = (name) => {
    document.cookie = name + "=; path=/; max-age=0";
  };

  const ensureStyles = () => {
    if (document.getElementById("cc-banner-styles")) return;

    const style = document.createElement("style");
    style.id = "cc-banner-styles";
    style.textContent = \`
      .cc-banner-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        z-index: 9998;
      }
      .cc-banner {
        position: fixed;
        left: 24px;
        right: 24px;
        max-width: 980px;
        margin: 0 auto;
        padding: 18px 20px;
        border-radius: 14px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        z-index: 9999;
        font-family: Arial, sans-serif;
      }
      .cc-banner.bottom { bottom: 24px; }
      .cc-banner.top { top: 24px; }
      .cc-banner.center {
        top: 50%;
        transform: translateY(-50%);
      }
      .cc-banner-row {
        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
      }
      .cc-banner-title {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 700;
      }
      .cc-banner-text {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        max-width: 680px;
      }
      .cc-banner-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .cc-btn {
        border: none;
        border-radius: 10px;
        padding: 10px 14px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
      }
      .cc-btn-secondary {
        background: rgba(255,255,255,0.16);
        color: inherit;
      }
      .cc-btn-primary {
        background: rgba(255,255,255,0.95);
        color: #111827;
      }
      .cc-preferences-modal {
        position: fixed;
        inset: 50% auto auto 50%;
        transform: translate(-50%, -50%);
        width: min(92vw, 560px);
        background: #ffffff;
        color: #111827;
        border-radius: 16px;
        box-shadow: 0 18px 60px rgba(0,0,0,0.25);
        z-index: 10000;
        font-family: Arial, sans-serif;
      }
      .cc-preferences-header,
      .cc-preferences-body,
      .cc-preferences-actions {
        padding: 18px 20px;
      }
      .cc-preferences-header {
        border-bottom: 1px solid #e5e7eb;
      }
      .cc-preferences-title {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 700;
      }
      .cc-preferences-sub {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #4b5563;
      }
      .cc-preferences-body {
        display: grid;
        gap: 12px;
      }
      .cc-pref-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .cc-pref-row:last-child {
        border-bottom: none;
      }
      .cc-pref-copy h4 {
        margin: 0 0 4px;
        font-size: 15px;
      }
      .cc-pref-copy p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.5;
      }
      .cc-switch {
        position: relative;
        width: 46px;
        height: 26px;
        flex-shrink: 0;
      }
      .cc-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .cc-slider {
        position: absolute;
        inset: 0;
        background: #cbd5e1;
        border-radius: 999px;
        transition: 0.2s ease;
      }
      .cc-slider:before {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        left: 3px;
        top: 3px;
        background: white;
        border-radius: 50%;
        transition: 0.2s ease;
      }
      .cc-switch input:checked + .cc-slider {
        background: #0f766e;
      }
      .cc-switch input:checked + .cc-slider:before {
        transform: translateX(20px);
      }
      .cc-switch input:disabled + .cc-slider {
        background: #94a3b8;
        cursor: not-allowed;
      }
      .cc-preferences-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
        border-top: 1px solid #e5e7eb;
      }
      .cc-settings-trigger {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 9997;
        border: none;
        border-radius: 999px;
        padding: 10px 14px;
        background: #111827;
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      }
      @media (max-width: 640px) {
        .cc-banner {
          left: 12px;
          right: 12px;
          bottom: 12px;
          top: auto;
          transform: none;
        }
        .cc-banner.center {
          top: auto;
          transform: none;
        }
        .cc-preferences-actions {
          justify-content: stretch;
        }
        .cc-preferences-actions .cc-btn {
          width: 100%;
        }
      }
    \`;
    document.head.appendChild(style);
  };

  const recordConsent = async ({ banner, action, choices }) => {
    try {
      await fetch(apiBase + "/api/consent/public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId,
          bannerId: banner._id,
          visitorId: "guest_" + Date.now(),
          choices,
          action,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error("Cookie banner: failed to record consent", error);
    }
  };

  const removeExistingUi = () => {
    const banner = document.getElementById("cc-banner");
    const overlay = document.getElementById("cc-banner-overlay");
    const modal = document.getElementById("cc-preferences-modal");
    if (banner) banner.remove();
    if (overlay) overlay.remove();
    if (modal) modal.remove();
  };

  const ensureOverlay = () => {
    let overlay = document.getElementById("cc-banner-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "cc-banner-overlay";
      overlay.className = "cc-banner-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  };

  const ensureSettingsTrigger = () => {
    if (document.getElementById("cc-settings-trigger")) return;

    const btn = document.createElement("button");
    btn.id = "cc-settings-trigger";
    btn.className = "cc-settings-trigger";
    btn.textContent = "Cookie settings";
    btn.addEventListener("click", () => {
      if (cachedBanner) openPreferences(cachedBanner);
    });
    document.body.appendChild(btn);
  };

  const applyConsentCookie = (action, choices) => {
    setCookie(
      consentCookieName,
      JSON.stringify({
        action,
        choices,
        updatedAt: new Date().toISOString(),
      })
    );
  };

  const savePreferences = async (banner, action, choices) => {
    applyConsentCookie(action, choices);
    await recordConsent({ banner, action, choices });
    removeExistingUi();
    ensureSettingsTrigger();
  };

  const openPreferences = (banner) => {
    if (!banner) return;

    ensureStyles();
    removeExistingUi();
    ensureOverlay();

    const storedConsent = getCookie(consentCookieName);
    let initialChoices = { ...defaultChoices };

    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        if (parsed && parsed.choices) {
          initialChoices = { ...defaultChoices, ...parsed.choices, necessary: true };
        }
      } catch (e) {}
    }

    const modal = document.createElement("div");
    modal.id = "cc-preferences-modal";
    modal.className = "cc-preferences-modal";

    modal.innerHTML = \`
      <div class="cc-preferences-header">
        <h3 class="cc-preferences-title">Privacy preferences</h3>
        <p class="cc-preferences-sub">Choose which categories of cookies you want to allow. Necessary cookies are always enabled.</p>
      </div>

      <div class="cc-preferences-body">
        <div class="cc-pref-row">
          <div class="cc-pref-copy">
            <h4>Necessary</h4>
            <p>Required for core functionality such as security, sessions, and form handling.</p>
          </div>
          <label class="cc-switch">
            <input type="checkbox" checked disabled />
            <span class="cc-slider"></span>
          </label>
        </div>

        <div class="cc-pref-row">
          <div class="cc-pref-copy">
            <h4>Preferences</h4>
            <p>Remember settings like language, region, or theme choices.</p>
          </div>
          <label class="cc-switch">
            <input type="checkbox" id="cc-pref-preferences" \${initialChoices.preferences ? "checked" : ""} />
            <span class="cc-slider"></span>
          </label>
        </div>

        <div class="cc-pref-row">
          <div class="cc-pref-copy">
            <h4>Functional</h4>
            <p>Support embedded features and enhanced site behavior.</p>
          </div>
          <label class="cc-switch">
            <input type="checkbox" id="cc-pref-functional" \${initialChoices.functional ? "checked" : ""} />
            <span class="cc-slider"></span>
          </label>
        </div>

        <div class="cc-pref-row">
          <div class="cc-pref-copy">
            <h4>Analytics</h4>
            <p>Help measure traffic, engagement, and site performance.</p>
          </div>
          <label class="cc-switch">
            <input type="checkbox" id="cc-pref-analytics" \${initialChoices.analytics ? "checked" : ""} />
            <span class="cc-slider"></span>
          </label>
        </div>

        <div class="cc-pref-row">
          <div class="cc-pref-copy">
            <h4>Marketing</h4>
            <p>Used for advertising, personalization, and campaign measurement.</p>
          </div>
          <label class="cc-switch">
            <input type="checkbox" id="cc-pref-marketing" \${initialChoices.marketing ? "checked" : ""} />
            <span class="cc-slider"></span>
          </label>
        </div>
      </div>

      <div class="cc-preferences-actions">
        <button class="cc-btn cc-btn-secondary" id="cc-pref-reject">Reject all</button>
        <button class="cc-btn cc-btn-secondary" id="cc-pref-accept">Accept all</button>
        <button class="cc-btn cc-btn-primary" id="cc-pref-save">Save preferences</button>
      </div>
    \`;

    document.body.appendChild(modal);

    const overlay = document.getElementById("cc-banner-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        removeExistingUi();
      }, { once: true });
    }

    document.getElementById("cc-pref-reject")?.addEventListener("click", async () => {
      await savePreferences(banner, "reject_all", {
        necessary: true,
        preferences: false,
        functional: false,
        analytics: false,
        marketing: false,
      });
    });

    document.getElementById("cc-pref-accept")?.addEventListener("click", async () => {
      await savePreferences(banner, "accept_all", {
        necessary: true,
        preferences: true,
        functional: true,
        analytics: true,
        marketing: true,
      });
    });

    document.getElementById("cc-pref-save")?.addEventListener("click", async () => {
      const choices = {
        necessary: true,
        preferences: !!document.getElementById("cc-pref-preferences")?.checked,
        functional: !!document.getElementById("cc-pref-functional")?.checked,
        analytics: !!document.getElementById("cc-pref-analytics")?.checked,
        marketing: !!document.getElementById("cc-pref-marketing")?.checked,
      };

      await savePreferences(banner, "custom", choices);
    });
  };

  const renderBanner = (banner, forceOpen = false) => {
    cachedBanner = banner;
    ensureStyles();
    ensureSettingsTrigger();

    const storedConsent = getCookie(consentCookieName);
    if (!banner) return;
    if (storedConsent && !forceOpen) return;

    removeExistingUi();

    if (banner.overlayEnabled || banner.layout === "modal") {
      ensureOverlay();
    }

    const el = document.createElement("div");
    el.id = "cc-banner";
    el.className = "cc-banner " + (banner.position || "bottom");
    el.style.background = banner.themeColor || "#0f766e";
    el.style.color = banner.textColor || "#ffffff";

    el.innerHTML = \`
      <div class="cc-banner-row">
        <div>
          <p class="cc-banner-title">\${banner.title || "Your privacy"}</p>
          <p class="cc-banner-text">\${banner.message || "We use cookies to enhance your browsing experience and analyze traffic."}</p>
        </div>
        <div class="cc-banner-actions">
          \${banner.showCustomize ? '<button class="cc-btn cc-btn-secondary" id="cc-customize-btn">Customize</button>' : ""}
          \${banner.showReject ? '<button class="cc-btn cc-btn-secondary" id="cc-reject-btn">Reject all</button>' : ""}
          <button class="cc-btn cc-btn-primary" id="cc-accept-btn">Accept all</button>
        </div>
      </div>
    \`;

    document.body.appendChild(el);

    document.getElementById("cc-accept-btn")?.addEventListener("click", async () => {
      await savePreferences(banner, "accept_all", {
        necessary: true,
        preferences: true,
        functional: true,
        analytics: true,
        marketing: true,
      });
    });

    document.getElementById("cc-reject-btn")?.addEventListener("click", async () => {
      await savePreferences(banner, "reject_all", {
        necessary: true,
        preferences: false,
        functional: false,
        analytics: false,
        marketing: false,
      });
    });

    document.getElementById("cc-customize-btn")?.addEventListener("click", () => {
      openPreferences(banner);
    });
  };

  window.CookieConsentManager = {
    openPreferences() {
      if (cachedBanner) openPreferences(cachedBanner);
    },
    reset() {
      removeCookie(consentCookieName);
      removeExistingUi();
      if (cachedBanner) renderBanner(cachedBanner, true);
    },
    getConsent() {
      const value = getCookie(consentCookieName);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  };

  fetch(apiBase + "/api/banner/public/" + siteId)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.banner) {
        renderBanner(data.banner);
      } else {
        console.error("Cookie banner: no published banner found");
      }
    })
    .catch((error) => {
      console.error("Cookie banner: failed to load config", error);
    });
})();
  `);
});

export default router;