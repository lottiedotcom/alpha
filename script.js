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

// INGREDIENTS THAT CAN BE EITHER ANIMAL OR PLANT DERIVED (Requires checking)
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

document.getElementById('scanBtn').addEventListener('click', () => {
    const input = document.getElementById('ingredientInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden', 'safe', 'warning', 'danger');

    if (!input.trim()) {
        resultsDiv.innerHTML = "<strong>Please paste an ingredient list first.</strong>";
        resultsDiv.classList.add('warning');
        return;
    }

    let foundHighRisk = [];
    let foundPossibleRisk = [];

    // Check for High Risk Triggers
    highRiskTriggers.forEach(trigger => {
        // Regex ensures we only match whole words (e.g., matching 'pork' but not 'spork')
        const regex = new RegExp('\\b' + trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        if (regex.test(input)) {
            foundHighRisk.push(trigger);
        }
    });

    // Check for Possible Risk Triggers
    possibleRiskTriggers.forEach(trigger => {
        const regex = new RegExp('\\b' + trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        if (regex.test(input)) {
            foundPossibleRisk.push(trigger);
        }
    });

    // Display Results
    if (foundHighRisk.length === 0 && foundPossibleRisk.length === 0) {
        resultsDiv.classList.add('safe');
        resultsDiv.innerHTML = `
            <strong>✅ No Known Triggers Found!</strong><br>
            <small>Disclaimer: Algorithms aren't perfect. Always double-check labels or contact manufacturers if you are highly sensitive.</small>
        `;
    } else {
        let html = `<strong>⚠️ Alert: Flagged Ingredients Detected</strong><br><br>`;
        
        // If there are high risk, make the box red. If only possible risk, make it yellow.
        if (foundHighRisk.length > 0) {
            resultsDiv.classList.add('danger');
        } else {
            resultsDiv.classList.add('warning');
        }

        if (foundHighRisk.length > 0) {
            html += `<div class="risk-high">🛑 DEFINITE AGS TRIGGERS (Mammalian / Alpha-Gal):</div>`;
            html += `<ul>${foundHighRisk.map(t => `<li><span class="trigger-item">${t}</span></li>`).join('')}</ul>`;
        }

        if (foundPossibleRisk.length > 0) {
            html += `<div class="risk-possible">⚠️ POSSIBLE TRIGGERS (Check if plant-based or synthetic):</div>`;
            html += `<ul>${foundPossibleRisk.map(t => `<li><span class="trigger-item">${t}</span></li>`).join('')}</ul>`;
        }

        resultsDiv.innerHTML = html;
    }
});

// Clear button logic
document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('ingredientInput').value = '';
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.add('hidden');
    resultsDiv.innerHTML = '';
});
