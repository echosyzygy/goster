document.addEventListener('DOMContentLoaded', function() {
  const newNotesBtn = document.getElementById('newNotesBtn');
  const saveNotesBtn = document.getElementById('saveNotesBtn');
  
  newNotesBtn.addEventListener('click', function() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('notes.html')
    });
    window.close();
  });

  saveNotesBtn.addEventListener('click', async function() {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      // Check if it's a notes tab
      if (tab.url.includes('notes.html')) {
        // Execute script to get notes content and save
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          function: saveNotes
        });
      } else {
        alert('Please open a notes tab first or navigate to an existing notes tab.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    window.close();
  });
});

// Function that will be injected into the notes tab
function saveNotes() {
  const content = document.getElementById('notepad').innerText || document.getElementById('notepad').textContent;
  
  if (!content.trim()) {
    alert('No content to save!');
    return;
  }

  // Create a blob with the content
  const blob = new Blob([content], { type: 'text/plain' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Generate filename with timestamp
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
  a.download = `notes-${timestamp}.txt`;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  alert('Notes saved successfully!');
}
