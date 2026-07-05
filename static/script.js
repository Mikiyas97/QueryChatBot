const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const uploadTrigger = document.getElementById("upload-trigger");
const fileInput = document.getElementById("file-input");
const loadingIndicator = document.getElementById("loading-indicator");
const themeToggleBtnSidebar = document.getElementById('theme-toggle-sidebar');
const newChatBtn = document.getElementById('new-chat-btn');
const historyList = document.getElementById('history-list');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarOverlay = document.getElementById('sidebar-overlay');

let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('chats') || '{}');

// Initialize app
function init() {
    renderHistory();
    if (Object.keys(chats).length === 0) {
        createNewChat();
    } else {
        // Load the most recent chat
        const sortedIds = Object.keys(chats).sort((a, b) => chats[b].timestamp - chats[a].timestamp);
        loadChat(sortedIds[0]);
    }
}

// Sidebar toggle for mobile
function toggleSidebar() {
    sidebar.classList.toggle('-ml-64');
    sidebar.classList.toggle('ml-0');
    sidebarOverlay.classList.toggle('hidden');
}

sidebarToggle.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', toggleSidebar);

// Theme Toggle
themeToggleBtnSidebar.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});

// Create New Chat
function createNewChat() {
    const id = Date.now().toString();
    chats[id] = {
        id: id,
        title: 'New Chat',
        messages: [],
        timestamp: Date.now()
    };
    saveChats();
    renderHistory();
    loadChat(id);
    
    // Close sidebar on mobile after clicking new chat
    if (window.innerWidth < 768) toggleSidebar();
}

newChatBtn.addEventListener('click', createNewChat);

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

function loadChat(id) {
    currentChatId = id;
    chatBox.innerHTML = '';
    
    if (chats[id].messages.length === 0) {
        // Show welcome message for empty chat
        appendWelcomeMessage();
    } else {
        chats[id].messages.forEach(msg => {
            appendMessage(msg.avatar, msg.content, msg.type, msg.extraContent, false);
        });
    }
    
    // Update active state in sidebar
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.remove('bg-gray-100', 'dark:bg-white/10', 'text-yellow-600', 'dark:text-yellow-400');
        if (item.dataset.id === id) {
            item.classList.add('bg-gray-100', 'dark:bg-white/10', 'text-yellow-600', 'dark:text-yellow-400');
        }
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderHistory() {
    historyList.innerHTML = '';
    const sortedIds = Object.keys(chats).sort((a, b) => chats[b].timestamp - chats[a].timestamp);
    
    sortedIds.forEach(id => {
        const chat = chats[id];
        const item = document.createElement('div');
        item.className = `history-item group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm hover:bg-gray-100 dark:hover:bg-white/5 ${id === currentChatId ? 'bg-gray-100 dark:bg-white/10 text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`;
        item.dataset.id = id;
        
        item.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 opacity-60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="truncate flex-1">${chat.title}</span>
            <button class="delete-chat opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1" data-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        `;
        
        item.addEventListener('click', (e) => {
            if (e.target.closest('.delete-chat')) {
                deleteChat(id);
            } else {
                loadChat(id);
                if (window.innerWidth < 768) toggleSidebar();
            }
        });
        
        historyList.appendChild(item);
    });
}

function deleteChat(id) {
    if (confirm('Delete this conversation?')) {
        delete chats[id];
        saveChats();
        if (currentChatId === id) {
            const keys = Object.keys(chats);
            if (keys.length > 0) {
                loadChat(keys[0]);
            } else {
                createNewChat();
            }
        }
        renderHistory();
    }
}

function appendWelcomeMessage() {
    appendMessage('🤖', `
        Hello! I'm your movie database expert. I can help you find ratings, release dates, or even perform complex analysis across the IMDb dataset.
        <div class="flex gap-2 flex-wrap mt-4">
            <button onclick="fillAndSend('Show me the top 10 highest rated movies')" class="text-xs bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm">Top 10 movies based on rating</button>
            <button onclick="fillAndSend('Which movies were released in 2023?')" class="text-xs bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm">Released 2023</button>
        </div>
    `, 'ai', '', false);
}

// Auto-resize textarea
messageInput.addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

function fillAndSend(text) {
  messageInput.value = text;
  messageInput.dispatchEvent(new Event('input'));
  chatForm.dispatchEvent(new Event('submit'));
}

function appendMessage(avatar, content, type = 'ai', extraContent = '', shouldSave = true) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `flex gap-4 max-w-3xl mx-auto group ${type === 'user' ? 'justify-end' : ''}`;
  
  const innerHTML = type === 'user' 
    ? `
      <div class="bg-yellow-400 text-black px-4 py-2.5 rounded-2xl max-w-[80%] shadow-lg shadow-yellow-400/10 font-medium">
        ${content}
      </div>
    `
    : `
      <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs shadow-sm">${avatar}</div>
      <div class="space-y-4 pt-1 flex-1">
        <div class="text-gray-800 dark:text-gray-200 leading-relaxed">${content}</div>
        ${extraContent}
      </div>
    `;
  
  messageDiv.innerHTML = innerHTML;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (shouldSave && currentChatId) {
      chats[currentChatId].messages.push({ avatar, content, type, extraContent });
      // Update chat title if it's the first user message
      if (type === 'user' && chats[currentChatId].title === 'New Chat') {
          chats[currentChatId].title = content.length > 30 ? content.substring(0, 30) + '...' : content;
          renderHistory();
      }
      chats[currentChatId].timestamp = Date.now();
      saveChats();
  }
}

function createTable(columns, results) {
  let table = `<div class="overflow-x-auto my-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-white/10 text-sm">`;
  table += "<thead class='bg-gray-50 dark:bg-white/5'><tr>";
  columns.forEach(col => {
    table += `<th class='px-4 py-3 text-left font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider'>${col}</th>`;
  });
  table += "</tr></thead><tbody class='divide-y divide-gray-100 dark:divide-white/5'>";
  results.forEach(row => {
    table += "<tr class='hover:bg-gray-50 dark:hover:bg-white/5 transition-colors'>";
    row.forEach(cell => {
      table += `<td class='px-4 py-3 text-gray-700 dark:text-gray-300'>${cell}</td>`;
    });
    table += "</tr>";
  });
  table += "</tbody></table></div>";
  return table;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = messageInput.value.trim();
  if (!question) return;

  appendMessage('', question, 'user');
  messageInput.value = "";
  messageInput.style.height = "auto";

  loadingIndicator.classList.remove("hidden");
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    loadingIndicator.classList.add("hidden");

    if (data.error) {
      appendMessage('⚠️', `Error: ${data.error}`, 'ai');
    } else {
      let extra = '';
      if (data.results && data.results.length > 0) {
        extra += createTable(data.columns, data.results);
      } else if (data.query) {
        extra += `<p class="text-sm text-gray-500 italic">No records matched your search.</p>`;
      }
      appendMessage('🤖', data.explanation, 'ai', extra);
    }
  } catch (error) {
    loadingIndicator.classList.add("hidden");
    appendMessage('❌', "Connection failed. Please check if the backend is running.", 'ai');
  }
});

// Handle mobile virtual keyboard resizing
function handleViewportResize() {
  const container = document.querySelector('.h-screen-safe');
  if (window.visualViewport) {
    const setHeight = () => {
      container.style.height = `${window.visualViewport.height}px`;
      // Scroll chat to bottom when keyboard opens/closes
      chatBox.scrollTop = chatBox.scrollHeight;
    };
    window.visualViewport.addEventListener('resize', setHeight);
    window.visualViewport.addEventListener('scroll', setHeight);
    setHeight();
  }
}

// Prevent iOS from scrolling the whole page when focusing on input
messageInput.addEventListener('focus', () => {
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 300);
});

// Initial call
handleViewportResize();
init();
