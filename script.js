// Canvas and image handling
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const addTextBtn = document.getElementById('addTextBtn');
const downloadBtn = document.getElementById('downloadBtn');
const textBoxesContainer = document.getElementById('textBoxesContainer');
const placeholder = document.getElementById('placeholder');
const templateGallery = document.getElementById('templateGallery');

// State
let currentImage = null;
let textBoxes = [];
let textBoxCounter = 0;

// Drag state
let isDragging = false;
let draggedTextBox = null;
let dragOffset = { x: 0, y: 0 };
let selectedTextBox = null;
let isResizing = false;
let resizeStart = { distance: 0, fontSize: 0 };

const TEXT_BOX_PADDING = 20;
const DELETE_BUTTON_SIZE = 18;
const RESIZE_HANDLE_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 120;

// Font families available
const fontFamilies = [
    'Impact',
    'Arial',
    'Comic Sans MS',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Helvetica'
];

// Position presets for text distribution
const positionPresets = ['top', 'middle', 'bottom'];

// Template images from Assets folder
const templateImages = [
    { name: 'Batman Slapping Robin', path: 'Assets/rules/Batman-Slapping-Robin.jpg' },
    { name: 'Disaster Girl', path: 'Assets/rules/Disaster-Girl.jpg' },
    { name: 'Laughing Leo', path: 'Assets/rules/Laughing-Leo.webp' }
];

// Initialize
imageInput.addEventListener('change', handleImageUpload);
addTextBtn.addEventListener('click', addTextBox);
downloadBtn.addEventListener('click', downloadMeme);

// Canvas drag handlers (mouse)
canvas.addEventListener('mousedown', handleCanvasMouseDown);
canvas.addEventListener('mousemove', handleCanvasMouseMove);
canvas.addEventListener('mouseup', handleCanvasMouseUp);
canvas.addEventListener('mouseleave', handleCanvasMouseUp); // Stop dragging if mouse leaves canvas

// Canvas drag handlers (touch for mobile)
canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
canvas.addEventListener('touchend', handleCanvasTouchEnd);
canvas.addEventListener('touchcancel', handleCanvasTouchEnd);

canvas.style.cursor = 'default';

// Load template gallery on page load
loadTemplateGallery();

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Clear template selection when uploading
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('template-selected');
    });

    const reader = new FileReader();
    reader.onload = function(event) {
        loadImageFromSource(event.target.result);
    };
    reader.readAsDataURL(file);
}

// Load image from source (used by both upload and template selection)
function loadImageFromSource(source) {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Allow CORS if needed
    img.onload = function() {
        currentImage = img;
        setupCanvas();
        drawMeme();
        placeholder.classList.add('hidden');
        canvas.style.display = 'block';
    };
    img.onerror = function() {
        alert('Failed to load image. Please check the file path: ' + source);
        console.error('Failed to load image:', source);
    };
    img.src = source;
}

// Load template gallery
function loadTemplateGallery() {
    if (templateImages.length === 0) {
        templateGallery.innerHTML = '<div class="template-gallery-empty">No templates available</div>';
        return;
    }

    templateGallery.innerHTML = '';
    
    templateImages.forEach((template, index) => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.dataset.index = index;
        templateItem.dataset.path = template.path;
        templateItem.setAttribute('role', 'button');
        templateItem.setAttribute('aria-label', `Select template: ${template.name}`);
        templateItem.setAttribute('tabindex', '0');
        
        const templateImg = document.createElement('img');
        templateImg.src = template.path;
        templateImg.alt = template.name;
        templateImg.className = 'template-thumbnail';
        templateImg.loading = 'lazy';
        
        const templateName = document.createElement('div');
        templateName.className = 'template-name';
        templateName.textContent = template.name;
        
        templateItem.appendChild(templateImg);
        templateItem.appendChild(templateName);
        
        // Click handler
        templateItem.addEventListener('click', () => {
            selectTemplate(template.path);
        });
        
        // Keyboard accessibility
        templateItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectTemplate(template.path);
            }
        });
        
        templateImg.onerror = function() {
            templateItem.classList.add('template-error');
            templateName.textContent = 'Failed to load';
            console.error('Failed to load template image:', template.path);
        };
        
        templateImg.onload = function() {
            // Image loaded successfully
            templateItem.classList.remove('template-error');
        };
        
        templateGallery.appendChild(templateItem);
    });
}

// Select a template image
function selectTemplate(imagePath) {
    // Clear file input
    imageInput.value = '';
    
    // Visual feedback - highlight selected template
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('template-selected');
    });
    const selectedItem = document.querySelector(`.template-item[data-path="${imagePath}"]`);
    if (selectedItem) {
        selectedItem.classList.add('template-selected');
    }
    
    // Load the template image
    loadImageFromSource(imagePath);
}

// Setup canvas dimensions
function setupCanvas() {
    if (!currentImage) return;

    const maxWidth = 800;
    const maxHeight = 600;

    let width = currentImage.width;
    let height = currentImage.height;

    // Scale down if too large
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
}

// Add a new text box
function addTextBox() {
    if (!currentImage) {
        alert('Please upload an image first!');
        return;
    }

    textBoxCounter++;
    const id = `textbox-${textBoxCounter}`;
    
    // Determine position based on number of text boxes
    const positionIndex = (textBoxes.length) % positionPresets.length;
    const position = positionPresets[positionIndex];
    
    let y;
    switch(position) {
        case 'top':
            y = canvas.height * 0.15;
            break;
        case 'middle':
            y = canvas.height * 0.5;
            break;
        case 'bottom':
            y = canvas.height * 0.85;
            break;
        default:
            y = canvas.height * 0.5;
    }

    const textBox = {
        id: id,
        text: '',
        fontSize: 40,
        fontFamily: 'Impact',
        color: '#ffffff', // Default white
        x: canvas.width / 2,
        y: y
    };

    textBoxes.push(textBox);
    renderTextBox(textBox);
    drawMeme();
}

// Render a text box control panel
function renderTextBox(textBox) {
    const textBoxDiv = document.createElement('div');
    textBoxDiv.className = 'text-box';
    textBoxDiv.id = textBox.id;

    textBoxDiv.innerHTML = `
        <div class="text-box-header">
            <span class="text-box-title">Text Box ${textBoxes.length}</span>
            <button class="btn-delete" data-id="${textBox.id}">Delete</button>
        </div>
        <div class="control-group">
            <label for="text-${textBox.id}">Text</label>
            <textarea id="text-${textBox.id}" placeholder="Enter text here... (Press Enter for new line)" rows="3">${textBox.text}</textarea>
        </div>
        <div class="control-group">
            <label for="fontSize-${textBox.id}">Font Size</label>
            <div class="slider-container">
                <input type="range" id="fontSize-${textBox.id}" min="12" max="120" value="${textBox.fontSize}">
                <span class="slider-value" id="fontSizeValue-${textBox.id}">${textBox.fontSize}px</span>
            </div>
        </div>
        <div class="control-group">
            <label for="fontFamily-${textBox.id}">Font Family</label>
            <select id="fontFamily-${textBox.id}">
                ${fontFamilies.map(font => 
                    `<option value="${font}" ${textBox.fontFamily === font ? 'selected' : ''}>${font}</option>`
                ).join('')}
            </select>
        </div>
        <div class="control-group">
            <label for="textColor-${textBox.id}">Text Color</label>
            <div class="color-picker-container">
                <input type="color" id="textColor-${textBox.id}" value="${textBox.color}">
                <span class="color-value">${textBox.color}</span>
            </div>
        </div>
    `;

    textBoxesContainer.appendChild(textBoxDiv);

    // Add event listeners
    const textInput = textBoxDiv.querySelector(`#text-${textBox.id}`);
    const fontSizeInput = textBoxDiv.querySelector(`#fontSize-${textBox.id}`);
    const fontSizeValue = textBoxDiv.querySelector(`#fontSizeValue-${textBox.id}`);
    const fontFamilySelect = textBoxDiv.querySelector(`#fontFamily-${textBox.id}`);
    const textColorInput = textBoxDiv.querySelector(`#textColor-${textBox.id}`);
    const colorValue = textBoxDiv.querySelector(`.color-value`);
    const deleteBtn = textBoxDiv.querySelector(`.btn-delete`);

    textInput.addEventListener('input', (e) => {
        textBox.text = e.target.value;
        drawMeme();
    });

    fontSizeInput.addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        textBox.fontSize = size;
        fontSizeValue.textContent = `${size}px`;
        drawMeme();
    });

    fontFamilySelect.addEventListener('change', (e) => {
        textBox.fontFamily = e.target.value;
        drawMeme();
    });

    textColorInput.addEventListener('input', (e) => {
        textBox.color = e.target.value;
        colorValue.textContent = e.target.value;
        drawMeme();
    });

    deleteBtn.addEventListener('click', () => {
        deleteTextBox(textBox.id);
    });
}

// Delete a text box
function deleteTextBox(id) {
    textBoxes = textBoxes.filter(tb => tb.id !== id);
    const textBoxDiv = document.getElementById(id);
    if (textBoxDiv) {
        textBoxDiv.remove();
    }
    if (selectedTextBox && selectedTextBox.id === id) {
        selectedTextBox = null;
    }
    drawMeme();
}

function getTextBoxBounds(textBox) {
    const textForBounds = textBox.text && textBox.text.trim().length > 0 ? textBox.text : 'Text';

    ctx.font = `${textBox.fontSize}px ${textBox.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = textForBounds.split('\n');
    const lineHeight = textBox.fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = textBox.y - (totalHeight / 2);
    const endY = startY + (lines.length * lineHeight);

    let maxWidth = 0;
    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, metrics.width);
    });

    const halfWidth = (maxWidth / 2) + TEXT_BOX_PADDING;
    const topY = startY - (textBox.fontSize / 2) - TEXT_BOX_PADDING;
    const bottomY = endY + (textBox.fontSize / 2) + TEXT_BOX_PADDING;

    return {
        left: textBox.x - halfWidth,
        right: textBox.x + halfWidth,
        top: topY,
        bottom: bottomY,
        width: halfWidth * 2,
        height: bottomY - topY
    };
}

function isPointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function getDeleteButtonRect(bounds) {
    return {
        left: bounds.right - DELETE_BUTTON_SIZE,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.top + DELETE_BUTTON_SIZE
    };
}

function getResizeHandleRect(bounds) {
    return {
        left: bounds.right - RESIZE_HANDLE_SIZE,
        right: bounds.right,
        top: bounds.bottom - RESIZE_HANDLE_SIZE,
        bottom: bounds.bottom
    };
}

function updateFontSizeControls(textBox) {
    const fontSizeInput = document.getElementById(`fontSize-${textBox.id}`);
    const fontSizeValue = document.getElementById(`fontSizeValue-${textBox.id}`);
    if (fontSizeInput) {
        fontSizeInput.value = textBox.fontSize;
    }
    if (fontSizeValue) {
        fontSizeValue.textContent = `${textBox.fontSize}px`;
    }
}

// Get text box at mouse position
function getTextBoxAtPosition(x, y) {
    // Check in reverse order (top to bottom) to get the topmost text box
    for (let i = textBoxes.length - 1; i >= 0; i--) {
        const textBox = textBoxes[i];
        const bounds = getTextBoxBounds(textBox);
        if (isPointInRect(x, y, bounds)) {
            return textBox;
        }
    }
    return null;
}

// Handle canvas mouse down
function handleCanvasMouseDown(e) {
    if (!currentImage) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedTextBox) {
        const bounds = getTextBoxBounds(selectedTextBox);
        const deleteRect = getDeleteButtonRect(bounds);
        const resizeRect = getResizeHandleRect(bounds);

        if (isPointInRect(x, y, deleteRect)) {
            deleteTextBox(selectedTextBox.id);
            selectedTextBox = null;
            canvas.style.cursor = 'default';
            e.preventDefault();
            return;
        }

        if (isPointInRect(x, y, resizeRect)) {
            isResizing = true;
            draggedTextBox = selectedTextBox;
            const centerX = (bounds.left + bounds.right) / 2;
            const centerY = (bounds.top + bounds.bottom) / 2;
            resizeStart.distance = Math.max(1, Math.hypot(x - centerX, y - centerY));
            resizeStart.fontSize = selectedTextBox.fontSize;
            canvas.style.cursor = 'nwse-resize';
            e.preventDefault();
            return;
        }
    }

    const clickedTextBox = getTextBoxAtPosition(x, y);

    if (clickedTextBox) {
        selectedTextBox = clickedTextBox;
        isDragging = true;
        draggedTextBox = clickedTextBox;
        dragOffset.x = x - clickedTextBox.x;
        dragOffset.y = y - clickedTextBox.y;
        canvas.style.cursor = 'move';
        drawMeme();
        e.preventDefault();
        return;
    }

    if (selectedTextBox) {
        selectedTextBox = null;
        drawMeme();
    }
}

// Handle canvas mouse move
function handleCanvasMouseMove(e) {
    if (!currentImage) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isResizing && draggedTextBox) {
        const bounds = getTextBoxBounds(draggedTextBox);
        const centerX = (bounds.left + bounds.right) / 2;
        const centerY = (bounds.top + bounds.bottom) / 2;
        const currentDistance = Math.max(1, Math.hypot(x - centerX, y - centerY));
        const scale = currentDistance / resizeStart.distance;
        const newSize = Math.round(resizeStart.fontSize * scale);
        draggedTextBox.fontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
        updateFontSizeControls(draggedTextBox);
        drawMeme();
        return;
    }

    if (isDragging && draggedTextBox) {
        // Update text box position
        draggedTextBox.x = x - dragOffset.x;
        draggedTextBox.y = y - dragOffset.y;

        // Constrain to canvas bounds
        draggedTextBox.x = Math.max(0, Math.min(canvas.width, draggedTextBox.x));
        draggedTextBox.y = Math.max(0, Math.min(canvas.height, draggedTextBox.y));

        drawMeme();
    } else {
        if (selectedTextBox) {
            const bounds = getTextBoxBounds(selectedTextBox);
            const deleteRect = getDeleteButtonRect(bounds);
            const resizeRect = getResizeHandleRect(bounds);

            if (isPointInRect(x, y, deleteRect)) {
                canvas.style.cursor = 'pointer';
                return;
            }
            if (isPointInRect(x, y, resizeRect)) {
                canvas.style.cursor = 'nwse-resize';
                return;
            }
        }

        // Update cursor if hovering over a text box
        const hoveredTextBox = getTextBoxAtPosition(x, y);
        canvas.style.cursor = hoveredTextBox ? 'move' : 'default';
    }
}

// Handle canvas mouse up
function handleCanvasMouseUp(e) {
    if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        draggedTextBox = null;
        canvas.style.cursor = 'default';
    }
}

// Touch event handlers (for mobile)
function handleCanvasTouchStart(e) {
    if (!currentImage) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    if (selectedTextBox) {
        const bounds = getTextBoxBounds(selectedTextBox);
        const deleteRect = getDeleteButtonRect(bounds);
        const resizeRect = getResizeHandleRect(bounds);

        if (isPointInRect(x, y, deleteRect)) {
            deleteTextBox(selectedTextBox.id);
            selectedTextBox = null;
            return;
        }

        if (isPointInRect(x, y, resizeRect)) {
            isResizing = true;
            draggedTextBox = selectedTextBox;
            const centerX = (bounds.left + bounds.right) / 2;
            const centerY = (bounds.top + bounds.bottom) / 2;
            resizeStart.distance = Math.max(1, Math.hypot(x - centerX, y - centerY));
            resizeStart.fontSize = selectedTextBox.fontSize;
            return;
        }
    }

    const clickedTextBox = getTextBoxAtPosition(x, y);

    if (clickedTextBox) {
        selectedTextBox = clickedTextBox;
        isDragging = true;
        draggedTextBox = clickedTextBox;
        dragOffset.x = x - clickedTextBox.x;
        dragOffset.y = y - clickedTextBox.y;
        drawMeme();
    } else if (selectedTextBox) {
        selectedTextBox = null;
        drawMeme();
    }
}

function handleCanvasTouchMove(e) {
    if (!currentImage || !draggedTextBox) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    if (isResizing) {
        const bounds = getTextBoxBounds(draggedTextBox);
        const centerX = (bounds.left + bounds.right) / 2;
        const centerY = (bounds.top + bounds.bottom) / 2;
        const currentDistance = Math.max(1, Math.hypot(x - centerX, y - centerY));
        const scale = currentDistance / resizeStart.distance;
        const newSize = Math.round(resizeStart.fontSize * scale);
        draggedTextBox.fontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
        updateFontSizeControls(draggedTextBox);
        drawMeme();
        return;
    }

    if (isDragging) {
        // Update text box position
        draggedTextBox.x = x - dragOffset.x;
        draggedTextBox.y = y - dragOffset.y;

        // Constrain to canvas bounds
        draggedTextBox.x = Math.max(0, Math.min(canvas.width, draggedTextBox.x));
        draggedTextBox.y = Math.max(0, Math.min(canvas.height, draggedTextBox.y));

        drawMeme();
    }
}

function handleCanvasTouchEnd(e) {
    if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        draggedTextBox = null;
    }
}

// Draw the meme on canvas
function drawMeme() {
    if (!currentImage) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // Draw all text boxes
    textBoxes.forEach(textBox => {
        if (!textBox.text) return; // Skip empty text boxes

        // Set font
        ctx.font = `${textBox.fontSize}px ${textBox.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Split text by line breaks
        const lines = textBox.text.split('\n');
        const lineHeight = textBox.fontSize * 1.2; // Line spacing
        
        // Calculate starting Y position (center all lines around textBox.y)
        const totalHeight = (lines.length - 1) * lineHeight;
        const startY = textBox.y - (totalHeight / 2);

        // Visual feedback: slightly reduce opacity when dragging
        const isBeingDragged = isDragging && draggedTextBox === textBox;
        const opacity = isBeingDragged ? 0.8 : 1.0;

        // Draw each line
        lines.forEach((line, index) => {
            if (line.trim() === '') return; // Skip empty lines
            
            const y = startY + (index * lineHeight);

            // Draw text with black outline (thicker border)
            ctx.strokeStyle = 'black';
            ctx.lineWidth = Math.max(5, textBox.fontSize / 8); // Thicker border - scales with font size
            ctx.strokeText(line, textBox.x, y);

            // Draw text with selected color fill
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = textBox.color || '#ffffff';
            ctx.fillText(line, textBox.x, y);
            ctx.restore();
        });
    });

    if (selectedTextBox) {
        const bounds = getTextBoxBounds(selectedTextBox);

        ctx.save();
        ctx.strokeStyle = 'rgba(245, 87, 108, 0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
        ctx.setLineDash([]);

        const deleteRect = getDeleteButtonRect(bounds);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.fillRect(deleteRect.left, deleteRect.top, DELETE_BUTTON_SIZE, DELETE_BUTTON_SIZE);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(deleteRect.left + 4, deleteRect.top + 4);
        ctx.lineTo(deleteRect.right - 4, deleteRect.bottom - 4);
        ctx.moveTo(deleteRect.right - 4, deleteRect.top + 4);
        ctx.lineTo(deleteRect.left + 4, deleteRect.bottom - 4);
        ctx.stroke();

        const resizeRect = getResizeHandleRect(bounds);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(resizeRect.left, resizeRect.top, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(resizeRect.left + 3, resizeRect.bottom - 3);
        ctx.lineTo(resizeRect.right - 3, resizeRect.top + 3);
        ctx.stroke();

        ctx.restore();
    }
}

// Download the meme
function downloadMeme() {
    if (!currentImage || textBoxes.length === 0) {
        alert('Please upload an image and add at least one text box!');
        return;
    }

    // Create a temporary canvas for full resolution export
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Use original image dimensions or scale appropriately
    const maxExportWidth = 1200;
    const maxExportHeight = 1200;
    
    let exportWidth = currentImage.width;
    let exportHeight = currentImage.height;
    
    // Scale down if too large
    if (exportWidth > maxExportWidth) {
        exportHeight = (exportHeight * maxExportWidth) / exportWidth;
        exportWidth = maxExportWidth;
    }
    if (exportHeight > maxExportHeight) {
        exportWidth = (exportWidth * maxExportHeight) / exportHeight;
        exportHeight = maxExportHeight;
    }
    
    tempCanvas.width = exportWidth;
    tempCanvas.height = exportHeight;
    
    // Draw image at export size
    tempCtx.drawImage(currentImage, 0, 0, exportWidth, exportHeight);
    
    // Calculate scale factors
    const scaleX = exportWidth / canvas.width;
    const scaleY = exportHeight / canvas.height;
    
    // Draw all text boxes scaled to export size
    textBoxes.forEach(textBox => {
        if (!textBox.text) return;
        
        // Scale font size and position
        const scaledFontSize = textBox.fontSize * scaleX;
        const scaledX = textBox.x * scaleX;
        const scaledY = textBox.y * scaleY;
        
        tempCtx.font = `${scaledFontSize}px ${textBox.fontFamily}`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        
        // Split text by line breaks
        const lines = textBox.text.split('\n');
        const lineHeight = scaledFontSize * 1.2; // Line spacing
        
        // Calculate starting Y position (center all lines around scaledY)
        const totalHeight = (lines.length - 1) * lineHeight;
        const startY = scaledY - (totalHeight / 2);
        
        // Draw each line
        lines.forEach((line, index) => {
            if (line.trim() === '') return; // Skip empty lines
            
            const y = startY + (index * lineHeight);
            
            // Draw outline (thicker border)
            tempCtx.strokeStyle = 'black';
            tempCtx.lineWidth = Math.max(5, scaledFontSize / 8); // Thicker border - scales with font size
            tempCtx.strokeText(line, scaledX, y);
            
            // Draw fill with selected color
            tempCtx.fillStyle = textBox.color || '#ffffff';
            tempCtx.fillText(line, scaledX, y);
        });
    });
    
    // Download
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}
