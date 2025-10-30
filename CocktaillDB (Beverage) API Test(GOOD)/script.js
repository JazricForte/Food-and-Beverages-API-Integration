let currentDrinks = [];
let allDrinks = [];
let currentPage = 1;
const drinksPerPage = 9;

async function populateCategories() {
    try {
        const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list');
        const data = await response.json();
        const categorySelect = document.getElementById('categoryFilter');
        
        data.drinks.forEach(category => {
            const option = document.createElement('option');
            option.value = category.strCategory;
            option.textContent = category.strCategory;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function filterByCategory() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    if (!selectedCategory) {
        currentDrinks = allDrinks;
    } else {
        currentDrinks = allDrinks.filter(drink => drink.strCategory === selectedCategory);
    }
    
    currentPage = 1;
    displayDrinks(currentDrinks);
    document.getElementById('totalCount').textContent = `Showing ${currentDrinks.length} drinks`;
}

function showRandomDrink() {
    // Fisher-Yates shuffle algorithm
    let shuffledDrinks = [...currentDrinks];
    for (let i = shuffledDrinks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDrinks[i], shuffledDrinks[j]] = [shuffledDrinks[j], shuffledDrinks[i]];
    }
    
    currentDrinks = shuffledDrinks;
    currentPage = 1; // Reset to first page
    displayDrinks(currentDrinks);
    document.getElementById('totalCount').textContent = `Showing ${currentDrinks.length} drinks (Randomized)`;
}

async function getAllDrinks() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading all drinks...';
    
    try {
        // Create array of letters A-Z
        const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        
        // Fetch drinks for each letter
        const allDrinksArrays = await Promise.all(
            letters.map(letter => 
                fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`)
                    .then(response => response.json())
                    .then(data => data.drinks || [])
            )
        );

        // Combine all drinks into one array and filter out null values
        allDrinks = allDrinksArrays.flat().filter(drink => drink !== null);
        currentDrinks = allDrinks;
        displayDrinks(currentDrinks);
        
        // Update total count
        const totalCount = document.getElementById('totalCount');
        totalCount.textContent = `Total Drinks: ${currentDrinks.length}`;
        
        // Populate categories after loading drinks
        await populateCategories();
    } catch (error) {
        resultsDiv.innerHTML = '<p>Error fetching drinks. Please try again later.</p>';
        console.error('Error:', error);
    }
}

function searchBreweries() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    let filteredDrinks = allDrinks;

    // Apply category filter
    if (selectedCategory) {
        filteredDrinks = filteredDrinks.filter(drink => drink.strCategory === selectedCategory);
    }

    // Apply search filter
    if (searchInput.trim()) {
        filteredDrinks = filteredDrinks.filter(drink => 
            drink.strDrink.toLowerCase().includes(searchInput) ||
            drink.strCategory.toLowerCase().includes(searchInput) ||
            drink.strAlcoholic.toLowerCase().includes(searchInput)
        );
    }

    if (filteredDrinks.length === 0) {
        document.getElementById('results').innerHTML = '<p style="text-align: center;">No cocktails found</p>';
        return;
    }

    currentDrinks = filteredDrinks;
    currentPage = 1;
    displayDrinks(currentDrinks);
    document.getElementById('totalCount').textContent = `Showing ${currentDrinks.length} drinks`;
}

function displayDrinks(drinks) {
    const resultsDiv = document.getElementById('results');
    const totalPages = Math.ceil(drinks.length / drinksPerPage);
    const startIndex = (currentPage - 1) * drinksPerPage;
    const endIndex = startIndex + drinksPerPage;
    const currentDrinksPage = drinks.slice(startIndex, endIndex);

    const cocktailsHTML = `
        <div class="grid-container">
            ${currentDrinksPage.map((drink, index) => `
                <div class="brewery-card" onclick="showModal(${startIndex + index})">
                    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                    <h2>${drink.strDrink}</h2>
                    <div class="drink-info">
                        <p>${drink.strAlcoholic}</p>
                        <p>Serve in: ${drink.strGlass}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const paginationHTML = totalPages > 1 ? `
        <div class="pagination">
            ${currentPage > 1 ? `<button onclick="changePage(${currentPage - 1})" class="page-btn">Previous</button>` : ''}
            <span class="page-info">Page ${currentPage} of ${totalPages}</span>
            ${currentPage < totalPages ? `<button onclick="changePage(${currentPage + 1})" class="page-btn">Next</button>` : ''}
        </div>
    ` : '';

    resultsDiv.innerHTML = cocktailsHTML + paginationHTML;
}

function changePage(newPage) {
    currentPage = newPage;
    displayDrinks(currentDrinks);
}

function getIngredients(drink) {
    let ingredients = '';
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient) {
            ingredients += `<li>${measure || ''} ${ingredient}</li>`;
        }
    }
    return ingredients;
}

function showModal(drinkIndex) {
    const drink = currentDrinks[drinkIndex];
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');

    const modalHTML = `
        <h2>${drink.strDrink}</h2>
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" style="width: 200px; border-radius: 5px; margin: 20px auto; display: block;">
        <p><strong>Category:</strong> ${drink.strCategory}</p>
        <p><strong>Type:</strong> ${drink.strAlcoholic}</p>
        <p><strong>Glass:</strong> ${drink.strGlass}</p>
        <div style="margin: 20px 0;">
            <h3 style="color: #ff6b6b;">Instructions:</h3>
            <p>${drink.strInstructions}</p>
        </div>
        <div>
            <h3 style="color: #ff6b6b;">Ingredients:</h3>
            <ul style="list-style-type: none; padding: 0;">
                ${getIngredients(drink)}
            </ul>
        </div>
    `;

    modalContent.innerHTML = modalHTML;
    modal.style.display = 'block';
    
    // Prevent scrolling of the background
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Load all drinks when the page loads
document.addEventListener('DOMContentLoaded', getAllDrinks);

// Allow searching when pressing Enter key on the search input
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBreweries();
    }
});