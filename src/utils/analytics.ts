// Analytics utility for tracking events
declare global {
    function gtag(...args: any[]): void;
}

export const trackEvent = (event: string, params?: Record<string, any>) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', event, params);
    } else {
        console.log('Track event:', event, params);
    }
};

export const trackPageView = (page: string) => {
    trackEvent('page_view', { page_path: page });
};

export const trackPosition = (x: number, y: number, z: number) => {
    // Round to 1 decimal place to reduce noise
    const pos = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, z: Math.round(z * 10) / 10 };
    trackEvent('heatmap_ping', pos);
};