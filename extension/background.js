// background.js
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('notes.html')
  });
});

// Handle download requests from the notes page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    try {
      // Create a data URL for the text content
      const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(request.content);
      
      chrome.downloads.download({
        url: dataUrl,
        filename: request.filename,
        saveAs: false  // Set to true if you want the save dialog
      }, function(downloadId) {
        if (chrome.runtime.lastError) {
          console.error('Download failed:', chrome.runtime.lastError);
          sendResponse({success: false, error: chrome.runtime.lastError.message});
        } else {
          console.log('Download started with ID:', downloadId);
          sendResponse({success: true, downloadId: downloadId});
        }
      });
    } catch (error) {
      console.error('Error creating download:', error);
      sendResponse({success: false, error: error.message});
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
