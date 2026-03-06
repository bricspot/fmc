/**
 * Focus Clinical - Toast Notification System
 * Usage: showToast('Message here', 'success') 
 * Types: 'success', 'error', 'info', 'warning'
 */

(function () {
    // Inject toast container styles once
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .toast {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        padding: 16px 20px;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        font-family: 'Geist', 'Instrument Sans', sans-serif;
        font-size: 0.95rem;
        line-height: 1.4;
        animation: toastSlideIn 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        transition: all 0.3s ease;
        border-left: 4px solid transparent;
      }
      .toast.toast-removing {
        animation: toastSlideOut 0.3s ease forwards;
      }
      .toast-success { border-left-color: #22c55e; }
      .toast-error { border-left-color: #ef4444; }
      .toast-info { border-left-color: #3b82f6; }
      .toast-warning { border-left-color: #f59e0b; }
      .toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        color: #fff;
      }
      .toast-success .toast-icon { background: #22c55e; }
      .toast-error .toast-icon { background: #ef4444; }
      .toast-info .toast-icon { background: #3b82f6; }
      .toast-warning .toast-icon { background: #f59e0b; }
      .toast-body { flex: 1; color: #1a1a2e; }
      .toast-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
      }
      .toast-close:hover { color: #1a1a2e; }
      @keyframes toastSlideIn {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes toastSlideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
      }
      @media (max-width: 480px) {
        .toast-container { left: 10px; right: 10px; top: 10px; }
        .toast { min-width: auto; }
      }
    `;
        document.head.appendChild(style);
    }

    // Ensure container exists
    function getContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    const ICONS = {
        success: '<i class="fas fa-check"></i>',
        error: '<i class="fas fa-times"></i>',
        info: '<i class="fas fa-info"></i>',
        warning: '<i class="fas fa-exclamation"></i>'
    };

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success' | 'error' | 'info' | 'warning'
     * @param {number} duration - Auto-dismiss ms (default 5000)
     */
    window.showToast = function (message, type = 'info', duration = 5000) {
        const container = getContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <div class="toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="toast-body">${message}</div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            dismissToast(toast);
        });

        container.appendChild(toast);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => dismissToast(toast), duration);
        }
    };

    function dismissToast(toast) {
        if (toast.classList.contains('toast-removing')) return;
        toast.classList.add('toast-removing');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }
})();
