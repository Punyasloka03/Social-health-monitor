let behaviorData = {
    scrollPoints: [], // Stores {y, timestamp}
    lastScrollTime: Date.now(),
    interactionCount: 0,
    startTime: Date.now(),
    isActive: true
};
window.addEventListener('scroll', () => {
    const now = Date.now();
    const currentY = window.scrollY;

    behaviorData.scrollPoints.push({ y: currentY, t: now });

    // Keep only the last 2 seconds of data for real-time velocity calculation
    if (behaviorData.scrollPoints.length > 20) {
        behaviorData.scrollPoints.shift();
    }
    
    analyzeVelocity();
}, { passive: true }); // 'passive' improves scrolling performance
['click', 'keydown', 'mousedown'].forEach(eventType => {
    window.addEventListener(eventType, () => {
        behaviorData.interactionCount++;
    });
});
setInterval(() => {
    if (!document.hidden) {
        const velocity = calculateAverageVelocity(); // pixels per millisecond
        const density = behaviorData.interactionCount;
        
        // Reset counters for the next window
        behaviorData.interactionCount = 0;

        // Send to DSRI Engine (Step 3)
        chrome.runtime.sendMessage({
            type: "BEHAVIOR_SIGNAL",
            payload: { velocity, density, timestamp: Date.now() }
        });
    }
}, 5000);