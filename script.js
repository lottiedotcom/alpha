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

// TAB SWITCHING LOGIC
const tabPaste = document.getElementById('tabPaste');
const tabScan = document.getElementById('tabScan');
const viewPaste = document.getElementById('viewPaste');
const viewScan = document.getElementById('viewScan');
const resultsDiv = document.getElementById('results');

tabPaste.addEventListener('click', () => {
    tabPaste.classList.add('active');
    tabScan.classList.remove('active');
    viewPaste.classList.remove('hidden');
    viewScan.classList.add('hidden');
    resultsDiv.classList.add('hidden'); // Clear results when switching tabs
});

tabScan.addEventListener('click', () => {
    tabScan.classList.add('active');
    tabPaste.classList.remove('active');
    viewScan.classList.remove('hidden');
    viewPaste.classList.add('hidden');
    resultsDiv.classList.add('hidden'); // Clear results when switching tabs
});

// CORE ANALYSIS LOGIC
function analyzeIngredients(textToAnalyze) {
    const input = textToAnalyze.toLowerCase();
    resultsDiv.classList.remove('hidden', 'safe', 'warning', 'danger');

    if (!input.trim() || input.includes("looking up barcode")) {
        resultsDiv.innerHTML = "<strong>Please provide a valid ingredient list.</strong>";
        resultsDiv.classList.add('warning');
        return;
    }

    let foundHighRisk = [];
    let foundPossibleRisk = [];

    highRiskTriggers.forEach(trigger => {
        const regex = new RegExp('\\b' + trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        if (regex.test(input)) { foundHighRisk.push(trigger); }
    });

    possibleRiskTriggers.forEach(trigger => {
        const regex = new RegExp('\\b' + trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        if (regex.test(input)) { foundPossibleRisk.push(trigger); }
    });

    if (foundHighRisk.length === 0 && foundPossibleRisk.length === 0) {
        resultsDiv.classList.add('safe');
        resultsDiv.innerHTML = `<strong>✅ No Known Triggers Found!</strong><br><small>Algorithms aren't perfect. Always double-check labels if highly sensitive.</small>`;
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

// MANUAL PASTE BUTTON LOGIC
document.getElementById('analyzeBtn').addEventListener('click', () => {
    const text = document.getElementById('ingredientInput').value;
    analyzeIngredients(text);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('ingredientInput').value = '';
    resultsDiv.classList.add('hidden');
});

// BARCODE SCANNER LOGIC
function onScanSuccess(decodedText, decodedResult) {
    html5QrcodeScanner.pause(true); // Pause scanning
    
    resultsDiv.classList.remove('hidden', 'safe', 'warning', 'danger');
    resultsDiv.classList.add('warning');
    resultsDiv.innerHTML = `<strong>Looking up barcode: ${decodedText}...</strong>`;
    
    // Query Open Food Facts API
    fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 1 && data.product.ingredients_text) {
                // Switch back to text view to show them the ingredients it found
                tabPaste.click();
                document.getElementById('ingredientInput').value = data.product.ingredients_text;
                analyzeIngredients(data.product.ingredients_text);
            } else {
                resultsDiv.classList.add('danger');
                resultsDiv.innerHTML = `<strong>Product found, but no ingredients listed in the database. Please scan something else or paste manually.</strong>`;
            }
            setTimeout(() => { html5QrcodeScanner.resume(); }, 3000);
        })
        .catch(err => {
            resultsDiv.classList.add('danger');
            resultsDiv.innerHTML = `<strong>Error looking up product or product not found.</strong>`;
            setTimeout(() => { html5QrcodeScanner.resume(); }, 3000);
        });
}

// Initialize the scanner UI
let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 150}, aspectRatio: 1.0 }, false);
html5QrcodeScanner.render(onScanSuccess);

