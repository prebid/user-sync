# Prebid User Sync utilities

`npm run build` generates two HTML files, `dist/load_cookie.html` and `dist/load-cookie-with-consent.html`, which can be used to initiate the bidder cookie sync with Prebid Server as documented [here](https://docs.prebid.org/prebid-server/developers/pbs-cookie-sync.html#manually-initiating-a-sync).

The two versions are identical except in how they interface with AMP to retrieve consent data:

 - `load-cookie.html` will attempt to poll AMP for consent data only when `source` is set to `"amp"`, and does not require consent data to run syncs (`defaultGdprScope` defaults to `0`);
 - `load-cookie-with-consent` will always attempt to poll AMP, and does not run syncs unless it can retrieve consent data (`defaultGdprScope` defaults to `1`).

Note: these files were formerly housed within the [Prebid Universal Creative repository](https://github.com/prebid/prebid-universal-creative). Now publishers and managed services will want to periodically= source these files from this repo to update their CDN.
 
## Query string parameters

Both pages accept the following query string parameters:

| Parameter        | Scope        | Type    | Description                                                                                                                                              | Example                                              |
|------------------|--------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| endpoint         | recommended  | string  | A URL-encoded pointer to Prebid Server                                                                                                                   | https%3A%2F%2Fprebid-server.example.com%2Fcookie_sync |
| max_sync_count   | optional     | integer | How many syncs are allowed                                                                                                                               | 5                                                    |
| bidders          | optional(*)  | string  | Which bidders are in the page. Required if coop-sync is not on for Prebid Server. This is a URL-encoded comma-separate list of bidder codes.             | bidderA%2CbidderB                                    |
| source           | optional(*)  | string  | Recommended for AMP. If set to 'amp' will force the response to be pixels only; `load-cookie.html`  will also attempt to retrieve consent data from AMP. | amp                                                  |
| gdpr             | optional     | integer | 1 if the request is in GDPR-scope, 0 if not.                                                                                                             | 0                                                    |
| gdpr_consent     | optional     | string  | TCF consent string                                                                                                                                       |                                                      |
| defaultGdprScope | optional     | integer | If set to 1, do not run syncs when consent data cannot be retrieved from AMP.                                                                            | 0                                                    |
| gpp_sid          | optional | string  | GPP Section ID(s). Number in string form or comma-separated list of numbers                                                                              | 6,7                                                  |
| gpp              | optional | string | Global Privacy Platform string |                                             |
| timeout          | optional     | integer | Timeout (in milliseconds) to wait for consent data from AMP. Defaults to 10000.                                                                          | 500                                                  |
| args             | optional     | string  | Passed through to the /cookie_sync call query string. Used by some host companies.                                                                       |                                                      |
| account          | optional     | string  | Passed through to the cookie_sync call query string. Used by PBS cookie sync to refine the selection of bidders to sync. | MyAccountID1234            |