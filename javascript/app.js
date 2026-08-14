/********** SERVICE WORKER REGISTRATION **********/
/*
 * Registers the offline service worker when supported. Failures are
 * non-fatal: the desktop still works fully online without it.
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("./sw.js")
      .then(function (reg) {
        // Registration succeeded.
      })
      .catch(function (error) {
        // Registration failed; the app keeps working online.
        if (window.console) console.warn("SW registration failed:", error);
      });
  });
}
