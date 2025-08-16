// notes.js
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const notepad = document.getElementById('notepad');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  
  // Auto-resize function
  function autoResize() {
    notepad.style.height = 'auto';
    notepad.style.height = notepad.scrollHeight + 'px';
  }
  
  // Auto-focus on the notepad
  notepad.focus();
  
  // Handle placeholder text
  notepad.addEventListener('focus', function() {
    if (this.textContent === 'Start typing your notes here...') {
      this.textContent = '';
    }
  });
  
  notepad.addEventListener('blur', function() {
    if (this.textContent.trim() === '') {
      this.textContent = 'Start typing your notes here...';
      this.style.color = '#999';
    } else {
      this.style.color = '#000';
    }
    autoResize(); // Resize after blur
  });
  
  // Initial placeholder
  if (notepad.textContent.trim() === '') {
    notepad.textContent = 'Start typing your notes here...';
    notepad.style.color = '#999';
  }
  
  // Handle typing
  notepad.addEventListener('input', function() {
    this.style.color = '#000';
    autoResize(); // Auto-resize on input
  });
  
  // Handle paste events
  notepad.addEventListener('paste', function() {
    setTimeout(autoResize, 0); // Auto-resize after paste
  });
  
  // Initialize auto-resize
  autoResize();
  
  // Add event listeners
  saveBtn.addEventListener('click', saveNotes);
  clearBtn.addEventListener('click', clearNotes);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveNotes();
    }
  });
  
  // Save function
  function saveNotes() {
    const content = notepad.innerText || notepad.textContent;
    if (!content.trim() || content.trim() === 'Start typing your notes here...') {
      alert('No content to save!');
      return;
    }
    
    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `notes-${timestamp}.txt`;
    
    // Use Chrome downloads API
    if (chrome && chrome.runtime) {
      // Send message to background script to handle download
      chrome.runtime.sendMessage({
        action: 'download',
        content: content,
        filename: filename
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          downloadWithBlob(content, filename);
          return;
        }
        if (response && response.success) {
          alert('Notes saved successfully to your Downloads folder!');
        } else {
          // Fallback to blob method
          downloadWithBlob(content, filename);
        }
      });
    } else {
      // Fallback to blob method
      downloadWithBlob(content, filename);
    }
  }
  
  // Fallback download method using blob
  function downloadWithBlob(content, filename) {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to save notes. Please try again.');
    }
  }
  
  // Clear function
  function clearNotes() {
    if (confirm('Are you sure you want to clear all notes?')) {
      notepad.textContent = 'Start typing your notes here...';
      notepad.style.color = '#999';
      notepad.focus();
      autoResize(); // Resize after clearing
    }
  }
});