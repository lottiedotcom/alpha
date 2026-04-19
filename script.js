// DEFINITE MAMMALS / ALPHA-GAL EPITOPE CARRIERS
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

// INGREDIENTS THAT CAN BE EITHER ANIMAL OR PLANT DERIVED
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

// CORE SCANNING LOGIC
function analyzeIngredients() {
    const input = document.getElementById('ingredientInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
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
        resultsDiv.innerHTML = `
            <strong>✅ No Known Triggers Found!</strong><br>
            <small>Algorithms aren't perfect. Always double-check labels if you are highly sensitive.</small>
        `;
    } else {
        let html = `<strong>⚠️ Alert: Flagged Ingredients Detected</strong><br><br>`;
        
        if (foundHighRisk.length > 0) {
            resultsDiv.classList.add('danger');
            html += `<div class="risk-high">🛑 DEFINITE AGS TRIGGERS (Mammalian / Alpha-Gal):</div>`;
            html += `<ul>${foundHighRisk.map(t => `<li><span class="trigger-item">${t}</span></li>`).join('')}</ul>`;
        } else {
            resultsDiv.classList.add('warning');
        }

        if (foundPossibleRisk.length > 0) {
            html += `<div class="risk-possible">⚠️ POSSIBLE TRIGGERS (Check if plant-based or synthetic):</div>`;
            html += `<ul>${foundPossibleRisk.map(t => `<li><span class="trigger-item">${t}</span></li>`).join('')}</ul>`;
        }
        resultsDiv.innerHTML = html;
    }
}

// BARCODE SCANNER LOGIC
function onScanSuccess(decodedText, decodedResult) {
    // Prevent continuous scanning while looking up the current barcode
    html5QrcodeScanner.pause(true);
    
    document.getElementById('ingredientInput').value = "Looking up barcode: " + decodedText + "...";
    
    // Query Open Food Facts API
    fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 1 && data.product.ingredients_text) {
                document.getElementById('ingredientInput').value = data.product.ingredients_text;
                analyzeIngredients(); // Auto-scan the retrieved ingredients
            } else {
                document.getElementById('ingredientInput').value = "";
                alert("Product found, but no ingredients are listed in the database. Please paste them manually.");
            }
            // Resume scanner after 3 seconds
            setTimeout(() => { html5QrcodeScanner.resume(); }, 3000);
        })
        .catch(err => {
            document.getElementById('ingredientInput').value = "";
            alert("Error looking up product or product not found in database.");
            html5QrcodeScanner.resume();
        });
}

// Initialize the barcode scanner UI
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: {width: 250, height: 150}, aspectRatio: 1.0 }, 
    /* verbose= */ false
);
html5QrcodeScanner.render(onScanSuccess);

// EVENT LISTENERS
document.getElementById('scanBtn').addEventListener('click', analyzeIngredients);

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('ingredientInput').value = '';
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.add('hidden');
    resultsDiv.innerHTML = '';
});
