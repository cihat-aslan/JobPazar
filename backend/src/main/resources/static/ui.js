// ui.js - Shared UI Logic for Toasts and Modals

// --- TOAST NOTIFICATIONS ---
function createToastHTML() {
    if (document.getElementById('customToast')) return;
    const div = document.createElement('div');
    div.id = 'customToast';
    div.className = 'toast-container';
    div.innerHTML = `
        <div class="toast-box">
            <span class="toast-close" onclick="closeToast()">&times;</span>
            <h3 style="margin-top:0; margin-bottom: 8px; color:#1e293b; font-size:16px;">JobPazar Asistanı</h3>
            <p id="toastMessage" style="color:#64748b; margin:0; font-size:14px; line-height:1.4;">...</p>
        </div>
    `;
    document.body.appendChild(div);
}

let toastTimeout;
function showToast(message) {
    createToastHTML(); // Ensure exists
    document.getElementById('toastMessage').innerText = message;
    const toast = document.getElementById('customToast');
    toast.style.display = 'flex';

    // Re-trigger animation
    const box = toast.querySelector('.toast-box');
    box.style.animation = 'none';
    box.offsetHeight; /* trigger reflow */
    box.style.animation = 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        closeToast();
    }, 5000);
}

function closeToast() {
    const toast = document.getElementById('customToast');
    if (toast) toast.style.display = 'none';
}

// --- CONFIRM MODAL ---
function createConfirmModalHTML() {
    if (document.getElementById('confirmModal')) return;
    const div = document.createElement('div');
    div.id = 'confirmModal';
    div.className = 'modal-overlay';
    div.innerHTML = `
        <div class="modal-box">
            <h3 class="modal-title">Onay Gerekiyor</h3>
            <p id="confirmMessage" class="modal-msg">...</p>
            <div class="modal-actions">
                <button id="btnConfirmCancel" class="modal-btn btn-cancel">İptal</button>
                <button id="btnConfirmOk" class="modal-btn btn-confirm">Evet, Onaylıyorum</button>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

function showConfirm(message, onConfirm) {
    createConfirmModalHTML();
    document.getElementById('confirmMessage').innerText = message;
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'flex';

    // Handlers
    const btnOk = document.getElementById('btnConfirmOk');
    const btnCancel = document.getElementById('btnConfirmCancel');

    // Remove old listeners to prevent stacking
    const newOk = btnOk.cloneNode(true);
    const newCancel = btnCancel.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);

    newOk.onclick = () => {
        modal.style.display = 'none';
        onConfirm();
    };
    newCancel.onclick = () => {
        modal.style.display = 'none';
    };
}

// --- INPUT MODAL ---
function createInputModalHTML() {
    if (document.getElementById('inputModal')) return;
    const div = document.createElement('div');
    div.id = 'inputModal';
    div.className = 'modal-overlay';
    div.innerHTML = `
        <div class="modal-box">
            <h3 id="inputTitle" class="modal-title">Giriş Yapın</h3>
            <input type="text" id="modalInputVal" class="modal-input" placeholder="...">
            <div class="modal-actions">
                <button id="btnInputCancel" class="modal-btn btn-cancel">İptal</button>
                <button id="btnInputOk" class="modal-btn btn-confirm">Tamam</button>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

function showInput(title, placeholder, onConfirm) {
    createInputModalHTML();
    document.getElementById('inputTitle').innerText = title;
    const input = document.getElementById('modalInputVal');
    input.placeholder = placeholder || '';
    input.value = ''; // Reset

    const modal = document.getElementById('inputModal');
    modal.style.display = 'flex';
    input.focus();

    // Handlers
    const btnOk = document.getElementById('btnInputOk');
    const btnCancel = document.getElementById('btnInputCancel');

    const newOk = btnOk.cloneNode(true);
    const newCancel = btnCancel.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);

    newOk.onclick = () => {
        const val = document.getElementById('modalInputVal').value;
        if (val) {
            modal.style.display = 'none';
            onConfirm(val);
        } else {
            // Shake effect for empty input? For now just visual cue or ignore
            document.getElementById('modalInputVal').style.borderColor = 'red';
        }
    };
    newCancel.onclick = () => {
        modal.style.display = 'none';
    };
    newCancel.onclick = () => {
        modal.style.display = 'none';
    };
}

// --- GENERIC INFO MODAL ---
function createInfoModalHTML() {
    if (document.getElementById('infoModal')) return;
    const div = document.createElement('div');
    div.id = 'infoModal';
    div.className = 'modal-overlay';
    div.innerHTML = `
        <div class="modal-box" style="max-width: 600px;">
            <h3 id="infoTitle" class="modal-title">Bilgi</h3>
            <div id="infoContent" class="modal-msg" style="text-align: left; max-height: 60vh; overflow-y: auto;">...</div>
            <div class="modal-actions">
                <button id="btnInfoOk" class="modal-btn btn-confirm">Tamam</button>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

function showModal(title, content) {
    createInfoModalHTML();
    document.getElementById('infoTitle').innerText = title;
    // Use innerHTML for content to allow formatting (like <br>)
    document.getElementById('infoContent').innerHTML = content;

    const modal = document.getElementById('infoModal');
    modal.style.display = 'flex';

    const btnOk = document.getElementById('btnInfoOk');
    // Remove old listeners
    const newOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);

    newOk.onclick = () => {
        modal.style.display = 'none';
    };
}

// --- FLOATING CHAT WIDGET ---
function initChatWidget() {
    // 1. Visibility Rules: Hide on Login, Register, or Admin pages
    const path = window.location.pathname;
    if (path.includes('login.html') || path.includes('register.html') || path.includes('admin')) {
        return;
    }

    if (document.getElementById('chatWidgetBtn')) return;

    // 2. Auth Check
    const userStr = localStorage.getItem('user');
    const isLoggedIn = !!userStr;

    // Create Button
    const btn = document.createElement('div');
    btn.id = 'chatWidgetBtn';
    btn.className = 'chat-widget-btn';
    btn.innerHTML = '<i class="fa-solid fa-robot"></i>';
    btn.title = "JobPazar Asistan";
    btn.onclick = toggleChatWidget;
    document.body.appendChild(btn);

    // Footer Content based on Auth
    let footerHTML = '';
    if (isLoggedIn) {
        footerHTML = `
            <input type="text" id="chatWidgetInput" placeholder="Bir soru sorun..." 
                style="flex:1; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none;"
                onkeypress="handleChatWidgetEnter(event)">
            <button onclick="sendChatWidgetMessage()" 
                style="background:#2563eb; color:white; border:none; border-radius:8px; width:40px; height:40px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        `;
    } else {
        footerHTML = `
            <div style="width:100%; text-align:center; font-size:14px; color:#64748b;">
                Sohbet etmek için <a href="login.html" style="color:#2563eb; font-weight:600; text-decoration:none;">giriş yapın</a>.
            </div>
        `;
    }

    // Create Window
    const win = document.createElement('div');
    win.id = 'chatWidgetWindow';
    win.className = 'chat-widget-window';
    win.innerHTML = `
        <div class="chat-widget-header">
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="fa-solid fa-robot"></i>
                <span style="font-weight:600;">JobPazar Asistan</span>
            </div>
            <button class="close-chat" onclick="toggleChatWidget()">&times;</button>
        </div>
        <div class="chat-widget-body" id="chatWidgetBody">
            <div class="chat-bubble ai">
                Merhaba! Ben JobPazar AI asistanıyım. 🤖
            </div>
        </div>
        <div class="chat-widget-footer">
            ${footerHTML}
        </div>
    `;
    document.body.appendChild(win);
}

function toggleChatWidget() {
    const win = document.getElementById('chatWidgetWindow');
    if (win.style.display === 'flex') {
        win.style.display = 'none';
    } else {
        win.style.display = 'flex';
        // Focus input after opening
        setTimeout(() => document.getElementById('chatWidgetInput').focus(), 100);
    }
}

async function sendChatWidgetMessage() {
    const input = document.getElementById('chatWidgetInput');
    const msg = input.value.trim();
    if (!msg) return;

    // Add User Message
    addChatWidgetBubble(msg, 'user');
    input.value = '';

    // Show Typing
    const typeId = 'typing-' + Date.now();
    addChatWidgetBubble('Asistan yazıyor...', 'ai', typeId);

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });

        // Remove Typing
        const typingElem = document.getElementById(typeId);
        if (typingElem) typingElem.remove();

        if (response.ok) {
            const data = await response.json();
            addChatWidgetBubble(data.response, 'ai');
        } else {
            addChatWidgetBubble("Üzgünüm, bir hata oluştu.", 'ai');
        }
    } catch (e) {
        console.error(e);
        const typingElem = document.getElementById(typeId);
        if (typingElem) typingElem.remove();
        addChatWidgetBubble("Bağlantı hatası.", 'ai');
    }
}

function addChatWidgetBubble(text, sender, id = null) {
    const body = document.getElementById('chatWidgetBody');
    const div = document.createElement('div');
    div.className = `chat-bubble ${sender}`;
    if (id) div.id = id;

    // Simple formatting
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    formatted = formatted.replace(/\n/g, '<br>');

    div.innerHTML = formatted;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function handleChatWidgetEnter(e) {
    if (e.key === 'Enter') sendChatWidgetMessage();
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
    initChatWidget();
}
