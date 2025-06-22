// Global variables
let selectedBgColor = '#f3f4f6';
let selectedFilter = 'none';
let currentPhotostrip = 1;
let cameraStream = null;
let capturedPhotos = [];
let currentSlot = 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Photo Booth App loaded');
    initializeApp();
});

function initializeApp() {
    // Set initial background color for SVG
    updateSVGBackground();
    
    // Initialize photo arrays for each photostrip
    resetCapturedPhotos();
    
    // Start camera automatically
    startCamera();
}

// Back button functionality
function goBack() {
    console.log('Going back...');
    if (cameraStream) {
        stopCamera();
    }
}

// Photostrip selection
function selectPhotostrip(stripNumber) {
    console.log(`Selecting photostrip ${stripNumber}`);
    
    // Remove active class from all strip buttons
    const stripBtns = document.querySelectorAll('.strip-btn');
    stripBtns.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    const selectedBtn = document.querySelector(`[onclick="selectPhotostrip(${stripNumber})"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Hide all photostrips
    const photostrips = document.querySelectorAll('.photostrip');
    photostrips.forEach(strip => strip.classList.remove('active'));
    
    // Show selected photostrip
    const selectedStrip = document.getElementById(`photostrip-${stripNumber}`);
    if (selectedStrip) {
        selectedStrip.classList.add('active');
        
        // Debug: Log information about the selected photostrip
        const slots = selectedStrip.querySelectorAll('rect, circle, path, polygon');
        console.log(`Photostrip ${stripNumber} has ${slots.length} potential slots:`);
        slots.forEach((slot, index) => {
            console.log(`  Slot ${index}: ${slot.tagName}, data-slot="${slot.getAttribute('data-slot')}", fill="${slot.getAttribute('fill')}"`);
        });
    } else {
        console.error(`Photostrip element with ID "photostrip-${stripNumber}" not found`);
    }
    
    currentPhotostrip = stripNumber;
    resetCapturedPhotos();
    
    console.log(`Selected photostrip: ${stripNumber}`);
}

// Fixed reset function - properly targets all slot elements
function resetCapturedPhotos() {
    capturedPhotos = [];
    currentSlot = 0;
    
    // Reset all slots to original state for current photostrip
    const activeStrip = document.querySelector('.photostrip.active');
    if (activeStrip) {
        // Target all possible slot selectors
        const slots = activeStrip.querySelectorAll('rect[data-slot], circle[data-slot], path[data-slot], polygon[data-slot], [data-slot]');
        
        console.log(`Found ${slots.length} slots to reset in photostrip ${currentPhotostrip}`);
        
        slots.forEach((slot, index) => {
            slot.classList.remove('filled');
            // Reset to original gray color
            slot.setAttribute('fill', '#747373');
            slot.removeAttribute('style'); // Remove any inline styles
            
            console.log(`Reset slot ${index}: ${slot.tagName} with data-slot="${slot.getAttribute('data-slot')}"`);
        });
        
        // Also clean up any existing patterns in defs to prevent memory leaks
        const defs = activeStrip.querySelector('defs');
        if (defs) {
            const patterns = defs.querySelectorAll('pattern[id*="photo-pattern"]');
            patterns.forEach(pattern => pattern.remove());
        }
    }
}

// Background color selection
function selectBgColor(element, color) {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('active'));
    
    element.classList.add('active');
    selectedBgColor = color;
    
    // Update SVG background instead of camera container
    updateSVGBackground();
    
    console.log(`Selected background color: ${color}`);
}

function updateSVGBackground() {
    // Update background color for all photostrip SVGs
    const photostrips = document.querySelectorAll('.photostrip svg');
    photostrips.forEach(svg => {
        // Find or create background rect
        let bgRect = svg.querySelector('.bg-rect');
        if (!bgRect) {
            bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.classList.add('bg-rect');
            bgRect.setAttribute('width', '100%');
            bgRect.setAttribute('height', '100%');
            svg.insertBefore(bgRect, svg.firstChild);
        }
        bgRect.setAttribute('fill', selectedBgColor);
    });
}

// Filter selection
function selectFilter(element, filter) {
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => option.classList.remove('active'));
    
    element.classList.add('active');
    selectedFilter = filter;
    
    // Apply filter to camera feed
    const cameraFeed = document.getElementById('cameraFeed');
    if (cameraFeed && cameraFeed.style.display !== 'none') {
        cameraFeed.style.filter = filter;
    }
    
    console.log(`Selected filter: ${filter}`);
}

// Camera functionality
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: 'user'
            } 
        });
        
        const cameraFeed = document.getElementById('cameraFeed');
        const cameraPlaceholder = document.getElementById('cameraPlaceholder');
        const startBtn = document.getElementById('startCameraBtn');
        const snapBtn = document.getElementById('snapBtn');
        
        cameraStream = stream;
        cameraFeed.srcObject = stream;
        cameraFeed.style.display = 'block';
        cameraFeed.style.filter = selectedFilter;
        
        if (cameraPlaceholder) cameraPlaceholder.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';
        if (snapBtn) snapBtn.style.display = 'block';
        
        console.log('Camera started successfully');
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        handleCameraError(error);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        
        const cameraFeed = document.getElementById('cameraFeed');
        const cameraPlaceholder = document.getElementById('cameraPlaceholder');
        const startBtn = document.getElementById('startCameraBtn');
        const snapBtn = document.getElementById('snapBtn');
        
        cameraFeed.style.display = 'none';
        cameraPlaceholder.style.display = 'flex';
        startBtn.style.display = 'block';
        snapBtn.style.display = 'none';
        
        console.log('Camera stopped');
    }
}

// Photo capture functionality
function snapPhoto() {
    if (!cameraStream) {
        alert('Camera not available!');
        return;
    }
    
    const maxPhotos = getMaxPhotosForCurrentStrip();
    if (capturedPhotos.length >= maxPhotos) {
        alert(`This photostrip only supports ${maxPhotos} photo(s). Please select a different layout or reset.`);
        return;
    }
    
    const cameraFeed = document.getElementById('cameraFeed');
    const canvas = document.getElementById('captureCanvas');
    
    if (!cameraFeed || !canvas) {
        console.error('Missing camera feed or canvas element');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    
    console.log(`Capturing photo: ${canvas.width}x${canvas.height}`);
    
    // Save current context state
    ctx.save();
    
    // Mirror the image horizontally
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    // Apply filter to canvas context
    ctx.filter = selectedFilter;
    
    // Draw the current frame (mirrored)
    ctx.drawImage(cameraFeed, 0, 0);
    
    // Restore context state
    ctx.restore();
    
    // Get image data
    const imageData = canvas.toDataURL('image/png');
    
    // Add to captured photos
    capturedPhotos.push(imageData);
    
    console.log(`Photo captured! Slot: ${currentSlot}, Total photos: ${capturedPhotos.length}`);
    
    // Show preview in slot immediately
    showPhotoPreview(imageData, currentSlot);
    
    currentSlot++;
    
    // Auto-stop camera if all slots are filled
    if (capturedPhotos.length >= maxPhotos) {
        setTimeout(() => {
            stopCamera();
            alert('All photo slots filled! You can now download your photostrip.');
        }, 1000);
    }
}

function getMaxPhotosForCurrentStrip() {
    return currentPhotostrip;
}

function showPhotoPreview(imageData, slotIndex) {
    const activeStrip = document.querySelector('.photostrip.active');
    if (!activeStrip) {
        console.error('No active photostrip found');
        return;
    }
    
    // Try multiple ways to find the slot
    let slot = activeStrip.querySelector(`[data-slot="${slotIndex}"]`);
    
    if (!slot) {
        // Fallback: try to find by index in all possible slot elements
        const allSlots = activeStrip.querySelectorAll('rect, circle, path, polygon');
        slot = allSlots[slotIndex];
        
        if (slot) {
            // Add data-slot attribute if missing
            slot.setAttribute('data-slot', slotIndex);
            console.log(`Added data-slot="${slotIndex}" to ${slot.tagName} element`);
        }
    }
    
    if (!slot) {
        console.error(`No slot found for index ${slotIndex} in photostrip ${currentPhotostrip}`);
        return;
    }
    
    console.log(`Found slot for index ${slotIndex}: ${slot.tagName} with bbox:`, slot.getBBox());
    
    // Fill the slot with the captured photo
    fillSlot(slot, imageData);
    
    console.log(`Photo preview shown in slot ${slotIndex}`);
}


function fillSlot(slot, imageData) {
    if (!slot) {
        console.error('No slot provided to fillSlot');
        return;
    }
    
    const svgElement = slot.closest('svg');
    if (!svgElement) {
        console.error('Slot is not inside an SVG element');
        return;
    }
    
    // Ensure defs element exists
    let defs = svgElement.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgElement.insertBefore(defs, svgElement.firstChild);
    }
    
    // Create unique pattern ID
    const patternId = `photo-pattern-${currentPhotostrip}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create pattern element
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.id = patternId;
    pattern.setAttribute('patternUnits', 'objectBoundingBox');
    pattern.setAttribute('width', '1');
    pattern.setAttribute('height', '1');
    pattern.setAttribute('preserveAspectRatio', 'xMidYMid meet'); // Changed from slice to meet
    
    // Create image element for pattern
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', imageData);
    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('width', '1');
    image.setAttribute('height', '1');
    image.setAttribute('preserveAspectRatio', 'xMidYMid meet'); // Show full image without cropping
    
    // Append image to pattern
    pattern.appendChild(image);
    defs.appendChild(pattern);
    
    // Apply pattern to slot
    slot.setAttribute('fill', `url(#${patternId})`);
    slot.classList.add('filled');
    
    console.log(`Slot filled successfully: ${slot.tagName} with pattern ${patternId}`);
}

// Download functionality
function downloadImage(format) {
    if (capturedPhotos.length === 0) {
        alert('Please capture some photos first!');
        return;
    }
    
    const activeStrip = document.querySelector('.photostrip.active');
    if (!activeStrip) {
        alert('No photostrip selected!');
        return;
    }
    
    // Create a larger canvas for high-quality output
    const canvas = document.getElementById('downloadCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on photostrip dimensions
    const stripViewBox = activeStrip.getAttribute('viewBox').split(' ');
    const aspectRatio = parseInt(stripViewBox[2]) / parseInt(stripViewBox[3]);
    
    // Set a good resolution for printing/sharing
    canvas.height = 1200; // Fixed height for good quality
    canvas.width = canvas.height * aspectRatio;
    
    // Fill background with selected color
    ctx.fillStyle = selectedBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each captured photo in the correct positions
    let imagesLoaded = 0;
    
    if (capturedPhotos.length === 0) {
        downloadCanvasAsImage(canvas, format);
        return;
    }
    
    capturedPhotos.forEach((photoData, index) => {
        const img = new Image();
        img.onload = function() {
            // Calculate position based on photostrip layout
            const positions = getPhotoPositions(currentPhotostrip, canvas.width, canvas.height);
            if (positions[index]) {
                const pos = positions[index];
                
                // Draw the image maintaining aspect ratio and filling the designated area
                ctx.save();
                
                // Create clipping path for the photo area
                ctx.beginPath();
                ctx.rect(pos.x, pos.y, pos.width, pos.height);
                ctx.clip();
                
                // Calculate dimensions to fill the area while maintaining aspect ratio
                const imgAspect = img.width / img.height;
                const slotAspect = pos.width / pos.height;
                
                let drawWidth, drawHeight, drawX, drawY;
                
                if (imgAspect > slotAspect) {
                    // Image is wider than slot - fit to height
                    drawHeight = pos.height;
                    drawWidth = drawHeight * imgAspect;
                    drawX = pos.x - (drawWidth - pos.width) / 2;
                    drawY = pos.y;
                } else {
                    // Image is taller than slot - fit to width
                    drawWidth = pos.width;
                    drawHeight = drawWidth / imgAspect;
                    drawX = pos.x;
                    drawY = pos.y - (drawHeight - pos.height) / 2;
                }
                
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();
            }
            
            imagesLoaded++;
            // Download after all images are drawn
            if (imagesLoaded === capturedPhotos.length) {
                downloadCanvasAsImage(canvas, format);
            }
        };
        img.src = photoData;
    });
}

function debugPhotostrip(stripNumber = null) {
    const stripToDebug = stripNumber || currentPhotostrip;
    const strip = document.getElementById(`photostrip-${stripToDebug}`);
    
    if (!strip) {
        console.error(`Photostrip ${stripToDebug} not found`);
        return;
    }
    
    console.log(`=== Debugging Photostrip ${stripToDebug} ===`);
    console.log('SVG Element:', strip);
    console.log('ViewBox:', strip.getAttribute('viewBox'));
    
    const allElements = strip.querySelectorAll('*');
    console.log(`Total elements: ${allElements.length}`);
    
    const potentialSlots = strip.querySelectorAll('rect, circle, path, polygon');
    console.log(`Potential slot elements: ${potentialSlots.length}`);
    
    potentialSlots.forEach((element, index) => {
        const bbox = element.getBBox();
        console.log(`Element ${index}:`, {
            tag: element.tagName,
            'data-slot': element.getAttribute('data-slot'),
            fill: element.getAttribute('fill'),
            bbox: `${bbox.width}x${bbox.height} at (${bbox.x}, ${bbox.y})`,
            classes: element.className.baseVal || element.classList.toString()
        });
    });
    
    const defs = strip.querySelector('defs');
    if (defs) {
        const patterns = defs.querySelectorAll('pattern');
        console.log(`Existing patterns: ${patterns.length}`);
    }
    
    console.log('=== End Debug ===');
}


function getPhotoPositions(stripType, canvasWidth, canvasHeight) {
    // Define positions for each photostrip type
    const positions = {
        1: [{ 
            x: canvasWidth * 0.167, 
            y: canvasHeight * 0.133, 
            width: canvasWidth * 0.667, 
            height: canvasHeight * 0.533 
        }],
        2: [
            { 
                x: canvasWidth * 0.057, 
                y: canvasHeight * 0.128, 
                width: canvasWidth * 0.412, 
                height: canvasHeight * 0.63 
            },
            { 
                x: canvasWidth * 0.515, 
                y: canvasHeight * 0.128, 
                width: canvasWidth * 0.427, 
                height: canvasHeight * 0.63 
            }
        ],
        3: [
            { 
                x: canvasWidth * 0.06, 
                y: canvasHeight * 0.208, 
                width: canvasWidth * 0.88, 
                height: canvasHeight * 0.175 
            },
            { 
                x: canvasWidth * 0.06, 
                y: canvasHeight * 0.412, 
                width: canvasWidth * 0.88, 
                height: canvasHeight * 0.175 
            },
            { 
                x: canvasWidth * 0.06, 
                y: canvasHeight * 0.615, 
                width: canvasWidth * 0.88, 
                height: canvasHeight * 0.175 
            }
        ],
        4: [
            { 
                x: canvasWidth * 0.06, 
                y: canvasHeight * 0.038, 
                width: canvasWidth * 0.88, 
                height: canvasHeight * 0.205 
            },
            { 
                x: canvasWidth * 0.06, 
                y: canvasHeight * 0.263, 
                width: canvasWidth * 0.88, 
                height: canvasHeight * 0.205 
            },
            { 
                x: canvasWidth * 0.06, 
                y: canvasHeight * 0.488, 
                width: canvasWidth * 0.88, 
                height: canvasHeight * 0.205 
            },
            { 
                x: canvasWidth * 0.06, 
                y: canvasHeight * 0.713, 
                width: canvasWidth * 0.88, 
                height: canvasHeight * 0.205 
            }
        ]
    };
    
    return positions[stripType] || positions[1];
}

function downloadCanvasAsImage(canvas, format) {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (format === 'png') {
        link.download = `photostrip-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
    } else if (format === 'jpg') {
        link.download = `photostrip-${timestamp}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
    } else if (format === 'pdf') {
        // For PDF, we'll need to use a library like jsPDF
        // This is a simplified implementation
        link.download = `photostrip-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        console.log('PDF export would require additional library (jsPDF)');
    }
    
    link.click();
    console.log(`Downloaded photostrip as ${format.toUpperCase()}`);
}

// Reset functionality
function resetPhotostrip() {
    if (confirm('Are you sure you want to reset? This will clear all captured photos.')) {
        resetCapturedPhotos();
        stopCamera();
        console.log('Photostrip reset');
    }
}

// Share functionality
function sharePhotostrip() {
    if (capturedPhotos.length === 0) {
        alert('Please capture some photos first!');
        return;
    }
    
    // Check if Web Share API is supported
    if (navigator.share) {
        // Convert canvas to blob for sharing
        const canvas = document.getElementById('downloadCanvas');
        canvas.toBlob(blob => {
            const file = new File([blob], 'photostrip.png', { type: 'image/png' });
            
            navigator.share({
                title: 'Check out my photostrip!',
                text: 'Made with Photo Booth App',
                files: [file]
            }).catch(error => {
                console.error('Error sharing:', error);
                alert('Sharing failed. Please try downloading instead.');
            });
        });
    } else {
        // Fallback: copy link to clipboard or download
        alert('Sharing not supported on this device. Please use the download option.');
    }
}

// Utility functions
function showLoading(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    console.error(message);
    alert(message);
}

// Print functionality
function printPhotostrip() {
    if (capturedPhotos.length === 0) {
        alert('Please capture some photos first!');
        return;
    }
    
    const canvas = document.getElementById('downloadCanvas');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Photostrip</title>
                <style>
                    body { margin: 0; padding: 20px; text-align: center; }
                    img { max-width: 100%; height: auto; }
                    @media print {
                        body { padding: 0; }
                        img { max-width: none; width: auto; height: 100vh; }
                    }
                </style>
            </head>
            <body>
                <img src="${canvas.toDataURL()}" alt="Photostrip" />
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Space bar or Enter to snap photo
    if ((event.code === 'Space' || event.code === 'Enter') && cameraStream) {
        event.preventDefault();
        snapPhoto();
    }
    
    // Escape to stop camera
    if (event.code === 'Escape' && cameraStream) {
        stopCamera();
    }
    
    // R to reset
    if (event.code === 'KeyR' && event.ctrlKey) {
        event.preventDefault();
        resetPhotostrip();
    }
});

// Initialize tooltips or help system
function initializeHelp() {
    console.log('Help system initialized');
    // Add tooltips or help overlays here
}

// Error handling for camera permissions
function handleCameraError(error) {
    let message = 'Camera access failed: ';
    
    switch(error.name) {
        case 'NotAllowedError':
            message += 'Permission denied. Please allow camera access and refresh the page.';
            break;
        case 'NotFoundError':
            message += 'No camera found on this device.';
            break;
        case 'NotReadableError':
            message += 'Camera is being used by another application.';
            break;
        case 'OverconstrainedError':
            message += 'Camera constraints could not be satisfied.';
            break;
        default:
            message += error.message || 'Unknown error occurred.';
    }
    
    showError(message);
}

// Performance optimization: debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
const handleResize = debounce(() => {
    // Recalculate positions if needed
    console.log('Window resized');
}, 250);

window.addEventListener('resize', handleResize);