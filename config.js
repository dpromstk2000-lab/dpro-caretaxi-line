/**
 * DPRO 介護タクシー LINE
 * STEP CARETAXI-8 公開設定
 * 秘密鍵・Service Role Key・LINE Channel Secretは絶対に記載しないこと。
 */
window.CARETAXI_CONFIG = Object.freeze({
  APP_NAME: "DPRO 介護タクシー LINE",
  VERSION: "CARETAXI-8-BILLING-PAYMENT-20260728",
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
