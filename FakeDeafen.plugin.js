/**
 * @name FakeDeafen
 * @author zu1
 * @authorId 1135886879372357764
 * @version 1.3.0
 * @description Creates a fake deafen button that does nothing while keeping the real functionality hidden.
 * @invite W6JfvA4y66
 * @support https://discord.gg/GZ3HYfmzBk
 * @github https://github.com/zu1-pvp
 */

module.exports = class FakeDeafen {
    constructor() {
        this.deafenPattern = /self_deafs.truem/;
        this.textDecoder = new TextDecoder();
        this.domObserver = null;
        this.activeContextMenu = null;
        this.injectCustomStyles();
    }

    start() {
        this.modifyWebSocketBehavior();
        this.setupButtonObserver();
    }

    stop() {
        WebSocket.prototype.send = WebSocket.prototype.originalSend;
        this.removeFakeButtonElement();
        if (this.domObserver) this.domObserver.disconnect();
        this.removeInjectedStyles();
    }

    injectCustomStyles() {
        const styleIdentifier = 'fakeDeafenCustomStyles';
        if (document.getElementById(styleIdentifier)) return;

        const styleRules = `
            #fakeDeafenBtn {
                position: relative;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            #fakeDeafenBtn:hover {
                transform: scale(1.05);
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
            }

            #fakeDeafenBtn:active {
                transform: scale(0.95);
            }

            #fakeDeafenBtn::after {
                content: "FAKE";
                position: absolute;
                top: -8px;
                right: -8px;
                background: linear-gradient(135deg, #ff5e5e, #ff1a1a);
                color: white;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 5px;
                border-radius: 10px;
                border: 1px solid white;
                transform: rotate(15deg);
                opacity: 0.9;
            }

            .fakeDeafen-context-menu {
                position: absolute;
                background-color: #2f3136;
                border-radius: 8px;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                padding: 6px;
                z-index: 9999;
                animation: fadeIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                overflow: hidden;
                min-width: 180px;
            }

            .fakeDeafen-context-item {
                padding: 8px 12px;
                border-radius: 4px;
                color: #dcddde;
                cursor: pointer;
                display: flex;
                align-items: center;
                font-size: 14px;
                transition: background-color 0.2s ease;
            }

            .fakeDeafen-context-item:hover {
                background-color: #3d424d;
            }

            .fakeDeafen-context-item i {
                margin-right: 10px;
                width: 16px;
                height: 16px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = styleIdentifier;
        styleElement.textContent = styleRules;
        document.head.appendChild(styleElement);
    }

    removeInjectedStyles() {
        const styleElement = document.getElementById('fakeDeafenCustomStyles');
        if (styleElement) styleElement.remove();
    }

    modifyWebSocketBehavior() {
        const decoder = this.textDecoder;
        const pattern = this.deafenPattern;

        WebSocket.prototype.originalSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            if (data instanceof ArrayBuffer && pattern.test(decoder.decode(data))) {
                window.deafen = () => this.originalSend(data);
                FakeDeafen.createFakeButton();
            }
            this.originalSend(data);
        };
    }

    setupButtonObserver() {
        const observer = new MutationObserver(() => FakeDeafen.createFakeButton());
        this.domObserver = observer;
        observer.observe(document.body, { childList: true, subtree: true });
    }

    static createFakeButton() {
        const realDeafenButton = document.querySelector("button[aria-label='Deafen']");
        if (!realDeafenButton || document.querySelector("#fakeDeafenBtn")) return;

        const fakeButton = realDeafenButton.cloneNode(true);
        fakeButton.id = "fakeDeafenBtn";
        fakeButton.style.backgroundColor = "red";
        
        const contentWrapper = document.createElement('div');
        contentWrapper.style.position = 'relative';
        contentWrapper.style.display = 'contents';
        
        while (fakeButton.firstChild) {
            contentWrapper.appendChild(fakeButton.firstChild);
        }
        fakeButton.appendChild(contentWrapper);

        fakeButton.onclick = (e) => {
            if (e.button === 0) {
                window.deafen();
            }
        };

        fakeButton.oncontextmenu = (e) => {
            e.preventDefault();
            this.displayContextMenu(e, fakeButton);
        };

        realDeafenButton.parentNode.appendChild(fakeButton);
    }

    static displayContextMenu(event, buttonElement) {
        const existingMenu = document.querySelector('.fakeDeafen-context-menu');
        if (existingMenu) existingMenu.remove();

        const contextMenu = document.createElement('div');
        contextMenu.className = 'fakeDeafen-context-menu';
        
        const supportOption = document.createElement('div');
        supportOption.className = 'fakeDeafen-context-item';
        supportOption.innerHTML = `
            <i><svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path fill="currentColor" d="M11 11h2v6h-2zm0-4h2v2h-2z"></path></svg></i>
            <span>Support Server</span>
        `;
        supportOption.onclick = () => {
            window.open('https://discord.gg/GZ3HYfmzBk', '_blank');
            contextMenu.remove();
        };
        
        contextMenu.appendChild(supportOption);

        const buttonRect = buttonElement.getBoundingClientRect();
        const menuWidth = 180;
        const menuHeight = 42;
        
        let leftPosition = buttonRect.left;
        let topPosition = buttonRect.bottom + 5;
        
        if (leftPosition + menuWidth > window.innerWidth) {
            leftPosition = window.innerWidth - menuWidth - 5;
        }
        
        if (topPosition + menuHeight > window.innerHeight) {
            topPosition = buttonRect.top - menuHeight - 5;
        }
        
        contextMenu.style.left = `${leftPosition}px`;
        contextMenu.style.top = `${topPosition}px`;
        
        document.body.appendChild(contextMenu);

        const closeMenuHandler = (e) => {
            if (!contextMenu.contains(e.target) && e.target !== buttonElement) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenuHandler);
            }
        };
        
        document.addEventListener('click', closeMenuHandler);
    }

    removeFakeButtonElement() {
        const fakeButton = document.querySelector("#fakeDeafenBtn");
        if (fakeButton) fakeButton.remove();
        
        const contextMenu = document.querySelector('.fakeDeafen-context-menu');
        if (contextMenu) contextMenu.remove();
    }
};
