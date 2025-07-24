// Function to track clicks on streaming buttons
function trackClick(platform) {
    // This is where you'll add your actual pixel tracking code
    console.log(`Click tracked for ${platform}`);
    
    // Example Facebook Pixel event (you'll need to replace YOUR_PIXEL_ID)
    if (typeof fbq === 'function') {
        fbq('trackCustom', 'StreamingClick', {
            platform: platform,
            album: 'Next Year',
            artist: 'Daisy\'s Room'
        });
    }
}

// Add loading animation
document.addEventListener('DOMContentLoaded', function() {
    const card = document.querySelector('.card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
}); 