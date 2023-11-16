// Create a status bar element
const statusBar = document.createElement("div");
statusBar.textContent =
  "Xnl Reveal is getting reflections. If there are a large number of parameters, this can take a while. Wait until this message disappears if you want the results.";
statusBar.style.backgroundColor = "red";
statusBar.style.color = "white";
statusBar.style.position = "fixed";
statusBar.style.top = "0";
statusBar.style.left = "0";
statusBar.style.right = "0";
statusBar.style.padding = "10px";
statusBar.style.textAlign = "center";
statusBar.style.zIndex = "9999";

// Define a global constant for ignored src strings
const IGNORED_STRINGS = "googletagmanager|doubleclick|google-analytics";

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "dynamicScopeMenuItem") {
    dynamicScopeMenuItem(message.scopeAction, message.scopeHost);
  }
  if (message.action === "showWaybackEndpoints") {
    showWaybackEndpoints();
  }
  if (message.action === "showHiddenElements") {
    showHiddenElements();
  }
  if (message.action === "enableDisabledElements") {
    enableDisabledElements();
  }
  if (message.action === "showGoogleCache") {
    showGoogleCache();
  }
});

function htmlEntities(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Function to add or remove a host to the scope list
function dynamicScopeMenuItem(action, host) {
  // Get the current scopeItems from storage
  chrome.storage.sync.get(["scopeItems"], (result) => {
    const scopeItems = result.scopeItems || [];

    if (action === "Add") {
      // Add the host to scopeItems if it's not already in the list
      if (!scopeItems.includes(host)) {
        scopeItems.push(host);
      }
    } else if (action === "Remove") {
      // Remove the host from scopeItems if it exists
      const index = scopeItems.indexOf(host);
      if (index !== -1) {
        scopeItems.splice(index, 1);
      }
    }

    // Save the updated scopeItems back to storage
    chrome.storage.sync.set({ scopeItems }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving scopeItems:", chrome.runtime.lastError);
      } else {
        console.log(
          `Xnl Reveal: Scope - successfully ${
            action === "Add" ? "added" : "removed"
          } ${host}.`
        );
      }
    });
  });
  // Send a message to the background script to request tab information to update the menu
  chrome.runtime.sendMessage({ action: "getTabInfo" });
}

// Function to show all wayback endpoints for the domain in a separate window
function showWaybackEndpoints() {
  try {
    var currentURL = encodeURIComponent(
      window.location.hostname.replace(/^www\./, "")
    );
    console.log(`Xnl Reveal: Wayback location ${currentURL}`);
    var newURL =
      "https://web.archive.org/cdx/search/cdx?url=*." +
      currentURL +
      "&fl=original&collapse=urlkey&filter=!mimetype:warc/revisit|text/css|image/jpeg|image/jpg|image/png|image/svg.xml|image/gif|image/tiff|image/webp|image/bmp|image/vnd|image/x-icon|image/vnd.microsoft.icon|font/ttf|font/woff|font/woff2|font/x-woff2|font/x-woff|font/otf|audio/mpeg|audio/wav|audio/webm|audio/aac|audio/ogg|audio/wav|audio/webm|video/mp4|video/mpeg|video/webm|video/ogg|video/mp2t|video/webm|video/x-msvideo|video/x-flv|application/font-woff|application/font-woff2|application/x-font-woff|application/x-font-woff2|application/vnd.ms-fontobject|application/font-sfnt|application/vnd.android.package-archive|binary/octet-stream|application/octet-stream|application/pdf|application/x-font-ttf|application/x-font-otf|video/webm|video/3gpp|application/font-ttf|audio/mp3|audio/x-wav|image/pjpeg|audio/basic|application/font-otf&filter=!statuscode:404|301|302&page=";

    // open the window
    var newWindow = window.open(newURL, "_blank");
  } catch (error) {
    console.error("Xnl Reveal: Error in showWaybackEndpoints:", error);
  }
}

// Function to google chached version of the page in a separate window
function showGoogleCache() {
  try {
    var newURL =
      "https://webcache.googleusercontent.com/search?q=cache:" +
      window.location;

    // open the window
    var newWindow = window.open(newURL, "_blank");
  } catch (error) {
    console.error("Xnl Reveal: Error in showGoogleCache:", error);
  }
}

// Function to enable disabled elements
function enableDisabledElements() {
  try {
    document
      .querySelectorAll(
        ':not(img):not(span):not(div)[disabled],:not(img):not(span):not(div)[disabled=""]'
      )
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS, "i").test(src)) {
          e.disabled = false;
          e.style.cssText = "border-color: blue; border-width: 3px";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: blue;">Disabled ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error("Xnl Reveal: Error in enableDisabledElements:", error);
  }
}

// Function to show hidden elements
function showHiddenElements() {
  try {
    document
      .querySelectorAll(
        ":not(img):not(span):not(div)[type=hidden],:not(img):not(span):not(div)[hidden]"
      )
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS).test(src)) {
          e.type = "text";
          e.style.cssText = "border-color: red; border-width: 3px";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: red;">Hidden ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error("Xnl Reveal: Error in showHiddenElements (hidden):", error);
  }
  try {
    document
      .querySelectorAll(':not(img):not(span):not(div)[style*="display: none;"]')
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS).test(src)) {
          e.type = "text";
          e.style.cssText = "border-color: red; border-width: 3px";
          e.style.display = "block";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: red;">Hidden ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error(
      "Xnl Reveal: Error in showHiddenElements (display none):",
      error
    );
  }
  try {
    document
      .querySelectorAll(
        ':not(img):not(span):not(div)[style*="visibility: hidden;"]'
      )
      .forEach((e) => {
        // Check if the element should be ignored based on the 'src' attribute
        const src = e.getAttribute("src");
        if (!src || !new RegExp(IGNORED_STRINGS).test(src)) {
          e.type = "text";
          e.style.cssText = "border-color: red; border-width: 3px";
          e.style.visibility = "visible";
          const d = document.createElement("div");
          const elementType = e.getAttribute("type") || e.tagName;
          const elementName = e.getAttribute("name") || e.getAttribute("id");
          d.innerHTML = `<span style="color: red;">Hidden ${htmlEntities(
            elementType
          )} [${htmlEntities(elementName)}]  </span>`;
          e.parentNode.insertBefore(d, e).appendChild(e);
        }
      });
  } catch (error) {
    console.error(
      "Xnl Reveal: Error in showHiddenElements (visibility hidden):",
      error
    );
  }
}

// Read the user's random string and extension state from storage
chrome.storage.sync.get(
  [
    "canaryToken",
    "copyToClipboard",
    "checkDelay",
    "waybackRegex",
    "extensionDisabled",
    "alertsDisabled",
    "waybackDisabled",
    "hiddenDisabled",
    "disabledDisabled",
  ],
  (result) => {
    if (result.extensionDisabled === undefined) {
      chrome.storage.sync.set({ ["extensionDisabled"]: "true" });
      extensionDisabled = "true";
    } else {
      extensionDisabled = result.extensionDisabled || "true";
    }
    if (result.alertsDisabled === undefined) {
      chrome.storage.sync.set({ ["alertsDisabled"]: "true" });
      alertsDisabled = "true";
    } else {
      alertsDisabled = result.alertsDisabled || "true";
    }
    if (result.waybackDisabled === undefined) {
      chrome.storage.sync.set({ ["waybackDisabled"]: "true" });
      waybackDisabled = "true";
    } else {
      waybackDisabled = result.waybackDisabled || "true";
    }
    if (result.hiddenDisabled === undefined) {
      chrome.storage.sync.set({ ["hiddenDisabled"]: "true" });
      hiddenDisabled = "true";
    } else {
      hiddenDisabled = result.hiddenDisabled || "true";
    }
    if (result.disabledDisabled === undefined) {
      chrome.storage.sync.set({ ["disabledDisabled"]: "true" });
      disabledDisabled = "true";
    } else {
      disabledDisabled = result.disabledDisabled || "true";
    }
    if (result.canaryToken === undefined) {
      chrome.storage.sync.set({ ["canaryToken"]: "xnlreveal" });
      canaryToken = "xnlreveal";
    } else {
      canaryToken = result.canaryToken || "xnlreveal";
    }
    if (result.copyToClipboard === undefined) {
      chrome.storage.sync.set({ ["copyToClipboard"]: false });
      copyToClipboard = false;
    } else {
      copyToClipboard = result.copyToClipboard || false;
    }
    if (result.checkDelay === undefined) {
      chrome.storage.sync.set({ ["checkDelay"]: "2" });
      checkDelay = "2";
    } else {
      checkDelay = result.checkDelay || "2";
    }
    if (result.waybackRegex === undefined) {
      chrome.storage.sync.set({ ["waybackRegex"]: "" });
      waybackRegex = "";
    } else {
      waybackRegex = result.waybackRegex || "";
    }

    function writeWaybackEndpoints() {
      try {
        // Get the current location without schema and query srting
        currentLocation = location.host + location.pathname;
        if (!currentLocation.endsWith("/")) {
          currentLocation += "/";
        }
        // Check if this URL has already been used to check wayback
        chrome.storage.local.get(
          ["wayback://" + currentLocation],
          ({ ["wayback://" + currentLocation]: waybackPath }) => {
            if (!waybackPath) {
              // Send a message to background.js to request Wayback Machine data
              chrome.runtime.sendMessage(
                {
                  action: "fetchWaybackData",
                  location: currentLocation,
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    // Handle any error that may occur when sending the message
                    console.error(chrome.runtime.lastError);
                    return;
                  }
                  const { waybackData, error } = response;
                  if (error) {
                    // Handle the error if there's one
                    console.log(
                      "Xnl Reveal: Error fetching Wayback Machine data:",
                      error
                    );
                  } else {
                    // Process the Wayback Machine data here
                    if (waybackRegex != "") {
                      // Process only lines that end with ".js" (excluding lines that end with "?", "#", or whitespace)
                      const jsLines = waybackData
                        .split("\n")
                        .filter((line) =>
                          new RegExp(waybackRegex, "i").test(line.trim())
                        );
                      // Process the response if not blank
                      if (jsLines.join("\n").trim() != "") {
                        console.log(jsLines.join("\n").trim());
                      }
                    } else {
                      if (waybackData.trim() != "") {
                        console.log(waybackData.trim());
                      }
                    }
                  }
                }
              );
              // Mark this URL as visited
              const waybackData = {
                ["wayback://" + currentLocation]: true,
              };
              chrome.storage.local.set(waybackData);
            } else {
              console.log(
                `Xnl Reveal: Location ${currentLocation} already checked on wayback archive.`
              );
            }
          }
        );
      } catch (error) {
        // Handle other errors here
        console.error("Xnl Reveal: An error occurred:", error);
      }
    }

    function isHostInScope(callback) {
      // Send a message to the background script to request tab information
      chrome.runtime.sendMessage({ action: "getTabInfo" }, function (response) {
        if (response.error) {
          console.error(
            "An error occurred while querying tabs:",
            response.error
          );
          callback(false); // Return false when there's an error
          return;
        }

        const currentHost = response.currentHost;

        try {
          // Get the scope type from storage
          chrome.storage.sync.get(["scopeType"], (scopeResult) => {
            const scopeType = scopeResult.scopeType || "whitelist"; // Default to "whitelist" if not set

            // Get the scope items from storage
            chrome.storage.sync.get(["scopeItems"], (itemsResult) => {
              const scopeItems = itemsResult.scopeItems || [];

              // If scopeItems is empty, return true
              if (scopeItems.length === 0) {
                callback(true);
                return;
              }
              // Check if any scope items match the current host
              const isMatch = scopeItems.some((item) =>
                currentHost.includes(item)
              );

              // Determine the result based on scope type
              let result;
              if (scopeType === "whitelist") {
                result = isMatch;
              } else if (scopeType === "blacklist") {
                result = !isMatch;
              }

              // Use the callback to handle the result
              callback(result);
            });
          });
        } catch (error) {
          console.error(
            "An error occurred while accessing Chrome storage:",
            error
          );
          callback(false); // Return false when there's an error
        }
      });
    }

    // Function to replace parameter values with replacement arg in the URL
    function replaceParameterValues(url, replacement) {
      const urlObject = new URL(url);
      const params = urlObject.searchParams;
      for (let i = 0; i < params.keys().length; i++) {
        const key = params.keys()[i];
        params.set(key, replacement);
      }
      return urlObject.toString();
    }

    // Function to copy test to the users clipboard
    function copyToClipboardAsync(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {})
        .catch((error) => {
          console.error(
            `Xnl Reveal: Error copying to clipboard (${error}). Check that the site has permissions to access the clipboard in the browser`
          );
        });
    }

    function runAfterPageLoad() {
      try {
        // Send a message to the background script to request tab information
        chrome.runtime.sendMessage({ action: "getTabInfo" });

        // Check if the extension is enabled, an option is selected, and the current tab is in scope
        if (
          extensionDisabled === "false" &&
          (hiddenDisabled === "false" ||
            disabledDisabled === "false" ||
            alertsDisabled === "false" ||
            waybackDisabled === "false")
        ) {
          // Call isHostInScope with a callback to handle the result
          isHostInScope((inScope) => {
            if (inScope) {
              // Write wayback endpoints to console if the option is checked
              if (waybackDisabled === "false") {
                writeWaybackEndpoints();
              }
              // Show hidden fields if the option is checked
              if (hiddenDisabled === "false") {
                showHiddenElements();
              }
              // Enable disabled fields if the option is checked
              if (disabledDisabled === "false") {
                enableDisabledElements();
              }
              // Alert on reflections if enabled
              if (alertsDisabled === "false") {
                const params = new URLSearchParams(window.location.search);
                const reflectedParameters = [];

                // Initialize a counter to keep track of successful requests
                let successfulRequests = 0;

                params.forEach((value, key) => {
                  // Create a modified URL by replacing the current parameter's value
                  const modifiedParams = new URLSearchParams(params);
                  modifiedParams.set(key, canaryToken);
                  const modifiedURL = `${window.location.origin}${window.location.pathname}?${modifiedParams}`;

                  // Create a modified URL with parameter values replaced with the canary token for storage. This will ensure the same url with different parameter values does not cause the alert to be fired again
                  const modifiedURLForStorage = replaceParameterValues(
                    window.location.href,
                    canaryToken
                  );

                  // Check if this URL and parameter have already triggered an alert
                  chrome.storage.local.get(
                    [modifiedURLForStorage, key],
                    ({
                      [modifiedURLForStorage]: urlData,
                      [key]: paramData,
                    }) => {
                      if (!urlData || !paramData) {
                        // Initialize a timeout promise
                        const timeoutPromise = new Promise(
                          (resolve, reject) => {
                            const timeoutError = new Error(
                              `Xnl Reveal: Fetch timed out checking param "${key}" for URL: ${modifiedURL}`
                            );
                            setTimeout(() => {
                              reject(timeoutError);
                            }, 30000); // 30 seconds
                          }
                        );

                        document.body.appendChild(statusBar);

                        console.log(`Xnl Reveal: Fetching ${modifiedURL}`);
                        // Perform the fetch for this specific parameter
                        Promise.race([fetch(modifiedURL), timeoutPromise])
                          .then((response) => {
                            if (response instanceof Error) {
                              console.error(
                                "Xnl Reveal: Fetch error:",
                                response
                              ); // Handle fetch errors here
                            } else {
                              return response.text();
                            }
                          })
                          .then((text) => {
                            // Check if the random string is reflected in the response
                            if (text.includes(canaryToken)) {
                              reflectedParameters.push(key);
                            }
                            // Mark this URL and parameter as alerted
                            const alertData = {
                              [modifiedURLForStorage]: true,
                              [key]: true,
                            };
                            chrome.storage.local.set(alertData);

                            // Increment the successful requests counter
                            successfulRequests++;

                            // Check if we have processed all parameters and found reflections
                            if (successfulRequests === params.size) {
                              if (reflectedParameters.length > 0) {
                                reflectionConsoleMsg = `Xnl Reveal: Reflection found in URL ${
                                  window.location.href
                                }\nReflected Parameters: ${reflectedParameters.join(
                                  ", "
                                )}`;
                                reflectionAlertMsg = `Xnl Reveal:\n\nReflection found in URL ${
                                  window.location.href
                                }\n\nReflected Parameters: ${reflectedParameters.join(
                                  ", "
                                )}`;
                                // Write the info to the console too
                                console.log(reflectionConsoleMsg);
                                // Display an alert with the parameter names that reflect
                                if (alertsDisabled === "false") {
                                  // Copy the info to the clipboard if required
                                  if (copyToClipboard) {
                                    copyToClipboardAsync(reflectionConsoleMsg);
                                  }
                                  alert(reflectionAlertMsg);
                                }
                              }
                              // Remove the status bar once all requests are processed
                              statusBar.remove();
                            }
                          })
                          .catch((error) => {
                            console.error("Xnl Reveal: Fetch error:", error); // Handle fetch errors here

                            // Increment the successful requests counter even for failed requests
                            successfulRequests++;

                            // Check if we have processed all parameters
                            if (successfulRequests === params.size) {
                              statusBar.remove(); // Remove the status bar once all requests are processed
                            }
                          });
                      }
                    }
                  );
                });
              }
            }
          });
        }
      } catch (error) {
        // Handle other errors here
        console.error("Xnl Reveal: An error occurred:", error);

        // Remove the status bar if an error occurs
        statusBar.remove();
      }
    }

    // Use the window.onload event to trigger your code after the page has loaded.
    if (window.onload) {
      const existingOnLoad = window.onload;
      window.onload = function () {
        existingOnLoad();
        runAfterPageLoad();
      };
    } else {
      window.onload = runAfterPageLoad;
    }

    // Check if the window.onload event has already fired
    if (document.readyState === "complete") {
      // If it has, call the function immediately
      runAfterPageLoad();
    } else {
      // If it hasn't, add an event listener for the DOMContentLoaded event
      document.addEventListener("DOMContentLoaded", runAfterPageLoad);

      // Send a message to the background script to remove the scope menu
      chrome.runtime.sendMessage({ action: "removeScopeMenu" });
    }

    // Check if the extension is enabled and an option is selected. This will run again after the delay to catch dynamic content
    try {
      if (
        extensionDisabled === "false" &&
        (hiddenDisabled === "false" || disabledDisabled === "false")
      ) {
        // Call isHostInScope with a callback to handle the result
        isHostInScope((inScope) => {
          if (inScope) {
            setTimeout(() => {
              // Show hidden fields if the option is checked
              if (hiddenDisabled === "false") {
                showHiddenElements();
              }
              // Enable disabled fields if the option is checked
              if (disabledDisabled === "false") {
                enableDisabledElements();
              }
            }, Number(checkDelay) * 1000);
          }
        });
      }
    } catch (error) {
      // Handle other errors here
      console.error("Xnl Reveal: An error occurred:", error);
    }
  }
);
