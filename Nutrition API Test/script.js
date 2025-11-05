const API_KEY = '38025vWyqBQQH8W+M5MY6A==r33l1Kp5FYOSkNNi'; // Replace with your actual API Ninjas key
const API_URL = 'https://api.api-ninjas.com/v1/nutrition';

// State management
let foodItems = [];
let currentPage = 1;
let itemsPerPage = 5;
let currentSort = 'name';

// Sample queries to populate the initial randomized list
const sampleQueries = [
    // '1 cup rice',
    // '1 banana',
    // '100g chicken breast',
    // '1 apple',
    // '1 slice whole wheat bread',
    // '1 cup milk',
    // '1 egg',
    // '1 tbsp olive oil'
];

async function searchFood() {
    const query = document.getElementById('foodQuery').value.trim();
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

        // Replace displayed items with search results only
        foodItems = data.map(item => ({ ...item, searchQuery: query }));
        currentPage = 1;
        sortItems();
        displayFoodItems();

    } catch (error) {
        console.error('Search error:', error);
        foodList.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

function displayFoodItems() {
    const foodList = document.getElementById('foodList');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedItems = foodItems.slice(startIndex, endIndex);

    let html = '';
    displayedItems.forEach(item => {
        html += `
            <div class="food-item">
                <h2>${item.searchQuery}</h2>
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
        `;
    });

    foodList.innerHTML = html || '<p>No items to display</p>';
    updatePagination(foodItems.length);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function changePage(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next') {
        const totalPages = Math.ceil(foodItems.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
        }
    }
    displayFoodItems();
}

function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    currentPage = 1;
    displayFoodItems();
}

function sortItems() {
    currentSort = document.getElementById('sortBy').value;
    
    foodItems.sort((a, b) => {
        switch(currentSort) {
            case 'name':
                return a.searchQuery.localeCompare(b.searchQuery);
            case 'calories':
                return b.calories - a.calories;
            case 'protein':
                return b.protein_g - a.protein_g;
            case 'carbs':
                return b.carbohydrates_total_g - a.carbohydrates_total_g;
            case 'fat':
                return b.fat_total_g - a.fat_total_g;
            default:
                return 0;
        }
    });
    
    currentPage = 1;
    displayFoodItems();
}

function shuffleList() {
    for (let i = foodItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [foodItems[i], foodItems[j]] = [foodItems[j], foodItems[i]];
    }
    currentPage = 1;
    displayFoodItems();
}

// Initialize with empty state
// Load a randomized list of sample items on page load
async function loadSampleData() {
    const foodList = document.getElementById('foodList');
    foodList.innerHTML = 'Loading sample items...';

    try {
        const promises = sampleQueries.map(async (q) => {
            const url = API_URL + '?query=' + encodeURIComponent(q);
            try {
                const res = await fetch(url, { method: 'GET', headers: { 'X-Api-Key': API_KEY } });
                if (!res.ok) {
                    console.warn(`Failed to load ${q}: ${res.status}`);
                    return [];
                }
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data.map(d => ({ ...d, searchQuery: q }));
                }
                return [];
            } catch (e) {
                console.warn('Fetch error for', q, e.message);
                return [];
            }
        });

        const results = await Promise.all(promises);
        const items = results.flat();

        if (items.length === 0) {
            foodList.innerHTML = '<p>No sample items could be loaded. Try searching manually.</p>';
            return;
        }

        foodItems = items;
        // Randomize initial list
        shuffleList();
        currentPage = 1;
        displayFoodItems();
    } catch (err) {
        console.error('Error loading sample data:', err);
        foodList.innerHTML = `<p class="error">Error loading sample items: ${err.message}</p>`;
    }
}

window.onload = () => {
    loadSampleData();
};