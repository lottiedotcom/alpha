// TRIGGER LISTS
const highRiskTriggers = [
    "adeps bovis", "adeps suillus", "beef", "bison", "boar", "bear", "bone meal", 
    "bone phosphate", "carrageenan", "casein", "caseinate", "cetuximab", "chondroitin", 
    "collagen", "dairy", "milk", "butter", "cheese", "cream", "yogurt", "whey", 
    "elastin", "elk", "gelatin", "ghee", "goat", "heart", "heparin", "kangaroo", 
    "keratin", "kidney", "lactose", "lamb", "lanolin", "laneth", "lard", "liver", 
    "llama", "mallow", "mammal fat", "moose", "mutton", "organ meat", "organ meats", 
    "pancreatin", "pancrelipase", "pepperoni", "pork", "bacon", "ham", "sausage", 
    "rabbit", "sodium tallowate", "sour cream", "suet", "tallow", "tallowate", 
    "tallowamine", "thyroid extract", "tongue", "venison"
];

const possibleRiskTriggers = [
    "amino acids", "ammonium stearate", "arachidonic acid", "caprylic acid", 
    "caprylic/capric triglyceride", "caprylic triglyceride", "capric triglyceride",
    "cetearyl alcohol", "cetyl alcohol", "confectioner's glaze", "cysteine", 
    "l-cysteine", "diglycerides", "glycerin", "glycerol", "glycerides", 
    "hydrolyzed animal protein", "hydrolyzed protein", "isostearic acid", 
    "lactic acid", "magnesium stearate", "monoglycerides", "myristic acid", 
    "natural flavor", "natural flavoring", "oleic acid", "oleyl alcohol", 
    "palmitic acid", "peg-8 stearate", "peg-100 stearate", "polysorbate", 
    "rennet", "sodium stearate", "squalene", "stearic acid", "stearate", 
    "steareth", "varnish", "vitamin d3"
];

// UI ELEMENTS
const tabPaste = document.getElementById('tabPaste');
const tabScan = document.getElementById('tabScan');
const viewPaste = document.getElementById('viewPaste');
const viewScan = document.getElementById('viewScan');
const resultsDiv = document.getElementById('results');
const imageInput = document.getElementById('imageInput');
const ocrStatus = document.getElementById('ocrStatus');
const imagePreview = document.getElementById('imagePreview');
const ingredientInput = document.getElementById('ingredientInput');

// TAB SWITCHING
tabPaste.addEventListener('click', () => {
    tabPaste.classList.add('active');
    tabScan.classList.remove('active');
    viewPaste.classList.remove('hidden');
    viewScan.classList.add('hidden');
    resultsDiv.classList.add('hidden');
});

tabScan.addEventListener('click', () => {
    tabScan.classList.add('active');
    tabPaste.classList.remove('active');
    viewScan.classList.remove('hidden');
    viewPaste.classList.add('hidden');
    resultsDiv.classList.add('hidden');
});

// CORE ANALYSIS LOGIC
function analyzeIngredients(textToAnalyze) {
    // OCR can sometimes read commas wrong or add weird spaces, so we clean it slightly
    const input = textToAnalyze.toLowerCase().replace(/[\n\r]/g, ' ');
    resultsDiv.classList.remove('hidden', 'safe', 'warning', 'danger');

    if (!input.trim()) {
        resultsDiv.innerHTML = "<strong>Please provide a valid ingredient list.</strong>";
        resultsDiv.classList.add('warning');
        return;
    }

    let foundHighRisk = [];
    let foundPossibleRisk = [];

    // Find matches
    highRiskTriggers.forEach(trigger => {
        const regex = new RegExp('\\b' + trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        if (regex.test(input)) { foundHighRisk.push(trigger); }
    });

    possibleRiskTriggers.forEach(trigger => {
        const regex = new RegExp('\\b' + trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        if (regex.test(input)) { foundPossibleRisk.push(trigger); }
    });

    // Display Results
    if (foundHighRisk.length === 0 && foundPossibleRisk.length === 0) {
        resultsDiv.classList.add('safe');
        resultsDiv.innerHTML = `<strong>✅ No Known Triggers Found!</strong><br><small>Double-check the text above to ensure the scanner didn't misread any words.</small>`;
    } else {
        let html = `<strong>⚠️ Alert: Flagged Ingredients Detected</strong><br><br>`;
        if (foundHighRisk.length > 0) {
            resultsDiv.classList.add('danger');
            html += `<div class="risk-high">🛑 DEFINITE AGS TRIGGERS:</div><ul>${foundHighRisk.map(t => `<li><span class="trigger-item">${t}</span></li>`).join('')}</ul>`;
        } else {
            resultsDiv.classList.add('warning');
        }
        if (foundPossibleRisk.length > 0) {
            html += `<div class="risk-possible">⚠️ POSSIBLE TRIGGERS (Verify source):</div><ul>${foundPossibleRisk.map(t => `<li><span class="trigger-item">${t}</span></li>`).join('')}</ul>`;
        }
        resultsDiv.innerHTML = html;
    }
}

// TEXT BUTTON LOGIC
document.getElementById('analyzeBtn').addEventListener('click', () => {
    analyzeIngredients(ingredientInput.value);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ingredientInput.value = '';
    resultsDiv.classList.add('hidden');
});

// PHOTO / OCR LOGIC
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show image preview
    const reader = new FileReader();
    reader.onload = function(event) {
        imagePreview.src = event.target.result;
        imagePreview.classList.remove('hidden');
    }
    reader.readAsDataURL(file);

    // Show loading status
    ocrStatus.classList.remove('hidden');
    ocrStatus.innerText = "Reading text from image... please wait (this takes a few seconds).";

    // Run Tesseract OCR
    Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) } // Logs progress to console
    ).then(({ data: { text } }) => {
        ocrStatus.classList.add('hidden');
        
        // Put text into the text box and switch tabs
        ingredientInput.value = text;
        tabPaste.click(); // Switch back to the paste view so they can see/edit the text
        
        // Run analysis
        analyzeIngredients(text);
        
    }).catch(err => {
        console.error(err);
        ocrStatus.innerText = "Error reading image. Please try again or type manually.";
    });
});
