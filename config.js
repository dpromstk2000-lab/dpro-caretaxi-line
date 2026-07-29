/**
 * DPRO 介護タクシー LINE
 * STEP CARETAXI-12 営業サイト用・認証不要の読取専用プレビュー
 * 秘密鍵・Service Role Key・LINE Channel Secretは絶対に記載しないこと。
 */
(() => {
  "use strict";
  const params = new URLSearchParams(window.location.search);
  const previewRequested =
    params.get("preview") === "1" || params.get("embed_demo") === "1";

  if (!previewRequested) return;

  const page = window.location.pathname.split("/").pop() || "";
  const screenMap = Object.freeze({
    "owner.html": "owner",
    "owner-ipad.html": "dispatch",
    "staff.html": "staff",
    "billing.html": "billing",
    "ledger.html": "ledger"
  });
  const screen = screenMap[page];
  if (!screen) return;

  const version = params.get("v") || "CARETAXI-12";
  const embed = params.get("embed_demo") === "1" ? "&embed_demo=1" : "";
  const target =
    `./preview.html?screen=${encodeURIComponent(screen)}` +
    `&v=${encodeURIComponent(version)}${embed}`;

  window.location.replace(target);
})();

window.CARETAXI_CONFIG = Object.freeze({
  APP_NAME: "DPRO 介護タクシー LINE",
  VERSION: "CARETAXI-12-READONLY-PREVIEW-20260729",
  API_BASE_URL: "https://dpro-caretaxi-line-api.dpromstk2000.workers.dev",
  ORGANIZATION_CODE: "dpro_caretaxi_demo",
  LIFF_ID: "",
  DEMO_MODE: true,
  BUSINESS_PHONE: "092-000-9999",
  REQUEST_TIMEOUT_MS: 15000,
  DRAFT_STORAGE_KEY: "dpro_caretaxi_request_draft_v2",
  DEMO_LINE_USER_KEY: "dpro_caretaxi_demo_line_user_v1",
  MEMBER_SESSION_KEY: "dpro_caretaxi_member_session_v1",
  ADMIN_SESSION_KEY: "dpro_caretaxi_admin_session_v1",
  STAFF_SESSION_KEY: "dpro_caretaxi_staff_session_v1",
  REPEAT_PREFILL_KEY: "dpro_caretaxi_repeat_prefill_v1"
});
