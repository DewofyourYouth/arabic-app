import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const KofiWidget = () => {
    useEffect(() => {
        // Only load on web
        if (Capacitor.getPlatform() !== 'web') return;

        const scriptUrl = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
        
        // Check if script is already present
        if (document.querySelector(`script[src="${scriptUrl}"]`)) return;

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => {
            if (window.kofiWidgetOverlay) {
                window.kofiWidgetOverlay.draw('dewofyouryouth', {
                    'type': 'floating-chat',
                    'floating-chat.donateButton.text': '',
                    'floating-chat.donateButton.background-color': '#00b9fe',
                    'floating-chat.donateButton.text-color': '#fff'
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup logic if needed (Ko-fi widget doesn't provide an easy destroy method, 
            // but we can remove the script/element if we wanted to be strict. 
            // For a global widget, leaving it is usually fine or we could hide it via CSS)
            // Ideally we'd remove the injected iframe/divs if we unmounted, but since this is app-root level:
        };
    }, []);

    // No UI to render, it injects itself
    return null;
};

export default KofiWidget;
