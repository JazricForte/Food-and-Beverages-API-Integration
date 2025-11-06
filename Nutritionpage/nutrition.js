const API_KEY = 'BakLBi7bEBW8UJPDr4cXxPsYSpRKvBXMsN3K5dk3'; // Replace with your actual key
const API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

let foodItems = [];
let currentPage = 1;

const input = document.getElementById('query');
input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchFood();
    }
});

function searchAgain() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('query').value = '';
    setTimeout(function() {
        document.getElementById('query').focus();
    }, 500);
}

async function searchFood() {
    const query = document.getElementById('query').value;
    const foodList = document.getElementById('foodList');
    
    if (!query) {
        alert('Please enter a food query');
        return;
    }
    try {
        foodList.innerHTML = 'Loading...';

        const url = `${API_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
        console.log('Search URL:', url);

         const response = await fetch(url);

        console.log('Response status:', response.status);
        if (!response.ok) {
            const errText = await response.text();
            console.error('API error:', errText);
            foodList.innerHTML = `<p class="error">API error: ${response.status}</p>`;
            return;
        }

        const data = await response.json();

        if (!data.foods || data.foods.length === 0) {
            foodList.innerHTML = `<p class="error">No nutrition information found for "${query}"</p>`;
            return;
        }

        foodItems = data.foods.map(item => ({
            searchQuery: query,
            description: item.description || '',
            serving_size: item.householdServingFullText || '',
            calories: getNutrient(item.foodNutrients, 1008),       // 1008 = Energy (kcal)
            protein: getNutrient(item.foodNutrients, 1003),        // 1003 = Protein
            carbs: getNutrient(item.foodNutrients, 1005),          // 1005 = Carbs
            fat: getNutrient(item.foodNutrients, 1004),            // 1004 = Fat
            fiber: getNutrient(item.foodNutrients, 1079),          // 1079 = Fiber
            sugar: getNutrient(item.foodNutrients, 2000),          // 2000 = Sugar
            saturatedFat: getNutrient(item.foodNutrients, 1258),   // 1258 = Saturated Fat
            cholesterol: getNutrient(item.foodNutrients, 1253),    // 1253 = Cholesterol
            sodium: getNutrient(item.foodNutrients, 1093),         // 1093 = Sodium
            potassium: getNutrient(item.foodNutrients, 1092)       // 1092 = Potassium
        }));
        displayFoodItems();
        currentPage = 1;
        pageInfo.textContent = `Result ${currentPage} / ${foodItems.length}`;


    } catch (error) {
        console.error('Search error:', error);
        foodList.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

function getNutrient(nutrients, nutrientId) {
    const n = nutrients.find(n => n.nutrientId === nutrientId);
    return n ? `${n.value} ${n.unitName}` : 'N/A';
}

function displayFoodItems() {
    const foodList = document.getElementById('foodList');
    const pageInfo = document.getElementById('pageInfo');
    if (foodItems.length === 0) {
        foodList.innerHTML = '<p>No items to display</p>';
        pageInfo.textContent = '0 / 0';
        return;
    }

    if (currentPage < 0) currentPage = 0;
    if (currentPage >= foodItems.length) currentPage = foodItems.length - 1;
    const item = foodItems[currentPage];
    foodList.innerHTML = `
        <div class="food-item">
            <div class="card-header">${item.description} (${item.searchQuery})</div>
            <div class="card-body">
                <p class="serving-info">Serving: ${item.serving_size || 'N/A'}</p>
                <div class="macro-nutrients">
                    <div class="macro-nutrient"><strong>Calories</strong><br>${item.calories}</div>
                    <div class="macro-nutrient"><strong>Protein</strong><br>${item.protein}</div>
                    <div class="macro-nutrient"><strong>Carbs</strong><br>${item.carbs}</div>
                    <div class="macro-nutrient"><strong>Fat</strong><br>${item.fat}</div>
                </div>
                <div class="nutrients-list">
                    <ul>
                        <li>Fiber: ${item.fiber}</li>
                        <li>Sugar: ${item.sugar}</li>
                        <li>Saturated Fat: ${item.saturatedFat}</li>
                        <li>Cholesterol: ${item.cholesterol}</li>
                        <li>Sodium: ${item.sodium}</li>
                        <li>Potassium: ${item.potassium}</li>
                    </ul>
                </div>
            </div>
        </div>
        <button class="search-again" onclick="searchAgain()">Search again</button>
    `;
    pageInfo.textContent = `Result ${currentPage} of ${foodItems.length}`;
    window.scrollTo({ top: 150, behavior: 'smooth' });
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayFoodItems();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < foodItems.length - 1) {
        currentPage++;
        displayFoodItems();
    }
});