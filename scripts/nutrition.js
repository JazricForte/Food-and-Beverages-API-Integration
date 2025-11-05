const API_KEY = '38025vWyqBQQH8W+M5MY6A==r33l1Kp5FYOSkNNi';
const API_URL = 'https://api.api-ninjas.com/v1/nutrition';

let foodItems = [];

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

        const url = API_URL + '?query=' + encodeURIComponent(query);
        console.log('Search URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
            const errText = await response.text();
            console.error('API error:', errText);
            foodList.innerHTML = `<p class="error">API error: ${response.status}</p>`;
            return;
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            foodList.innerHTML = `<p class="error">No nutrition information found for "${query}"</p>`;
            return;
        }

        foodItems = data.map(item => ({ ...item, searchQuery: query }));
        currentPage = 1;
        displayFoodItems();

    } catch (error) {
        console.error('Search error:', error);
        foodList.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

function displayFoodItems() {
    const foodList = document.getElementById('foodList');

    let html = '';
    foodItems.forEach(item => {
        html += `
            <div class="food-item">
                <div class="card-header">${item.searchQuery}</div>
                <div class="card-body">
                    <p class="serving-info">Serving size: ${item.serving_size_g}g</p>
                    <div class="macro-nutrients">
                        <div class="macro-nutrient">
                            <strong>Calories</strong><br>${item.calories}
                        </div>
                        <div class="macro-nutrient">
                            <strong>Protein</strong><br>${item.protein_g}g
                        </div>
                        <div class="macro-nutrient">
                            <strong>Carbs</strong><br>${item.carbohydrates_total_g}g
                        </div>
                        <div class="macro-nutrient">
                            <strong>Fat</strong><br>${item.fat_total_g}g
                        </div>
                    </div>
                    <div class="nutrients-list">
                        <ul>
                            <li>Fiber: ${item.fiber_g}g</li>
                            <li>Sugar: ${item.sugar_g}g</li>
                            <li>Saturated Fat: ${item.fat_saturated_g}g</li>
                            <li>Cholesterol: ${item.cholesterol_mg}mg</li>
                            <li>Sodium: ${item.sodium_mg}mg</li>
                            <li>Potassium: ${item.potassium_mg}mg</li>
                        </ul>
                    </div>
                </div>
            </div>
            <button class="search-again" onclick="searchAgain()">Search again</button>
        `;
    });

    foodList.innerHTML = html || '<p>No items to display</p>';
    window.scrollTo({ top: 150, behavior: 'smooth' });
}