// Listen for when a tab is updated (loaded/refreshed)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only inject when the tab has finished loading
    if (changeInfo.status === 'complete' && tab.url) {
        // Skip chrome:// pages and extension pages
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            return;
        }
        
        // Inject your script
        injectTranslateScript(tabId);
    }
});

// Listen for when a new tab is created and activated
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
            // Small delay to ensure page is ready
            setTimeout(() => {
                injectTranslateScript(activeInfo.tabId);
            }, 100);
        }
    });
});

async function injectTranslateScript(tabId) {
    try {
        // Check if script is already injected to avoid duplicates
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                return window.schipperTranslateInjected;
            }
        });
        
        // If already injected, don't inject again
        if (results[0]?.result) {
            return;
        }
        
        // Inject your content script
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
        
        console.log('Schipper Translate injected into tab:', tabId);
        
    } catch (error) {
        // Fail silently for pages where injection isn't allowed
        console.log('Could not inject into tab:', tabId, error.message);
    }
}

// Optional: Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Schipper Translate extension started');
});