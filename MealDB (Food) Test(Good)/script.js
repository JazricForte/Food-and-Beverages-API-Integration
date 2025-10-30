// Constants
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const ITEMS_PER_PAGE = 6;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const randomBtn = document.getElementById('randomBtn');
const recipeList = document.getElementById('recipeList');
const pagination = document.getElementById('pagination');
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));

// State
let currentRecipes = [];
let currentPage = 1;

// Event Listeners
searchBtn.addEventListener('click', () => searchRecipes(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecipes(searchInput.value);
});
categoryFilter.addEventListener('change', () => filterByCategory(categoryFilter.value));
randomBtn.addEventListener('click', getRandomRecipe);

// Initialize
async function initialize() {
    await loadCategories();
    await searchRecipes('');
}

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch(`${BASE_URL}/categories.php`);
        const data = await response.json();
        
        data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.strCategory;
            option.textContent = category.strCategory;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Search Recipes
async function searchRecipes(query) {
    try {
        const response = await fetch(`${BASE_URL}/search.php?s=${query}`);
        const data = await response.json();
        currentRecipes = data.meals || [];
        currentPage = 1;
        displayRecipes();
        updatePagination();
    } catch (error) {
        console.error('Error searching recipes:', error);
    }
}

// Filter by Category
async function filterByCategory(category) {
    if (!category) {
        searchRecipes('');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
        const data = await response.json();
        currentRecipes = data.meals || [];
        currentPage = 1;
        displayRecipes();
        updatePagination();
    } catch (error) {
        console.error('Error filtering by category:', error);
    }
}

// Shuffle current recipes list
function getRandomRecipe() {
    if (currentRecipes.length === 0) return;
    
    // Fisher-Yates shuffle algorithm
    for (let i = currentRecipes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentRecipes[i], currentRecipes[j]] = [currentRecipes[j], currentRecipes[i]];
    }
    
    currentPage = 1;
    displayRecipes();
    updatePagination();
}

// Display Recipes
function displayRecipes() {
    recipeList.innerHTML = '';
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const recipesToShow = currentRecipes.slice(startIndex, endIndex);

    recipesToShow.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100">
                <img src="${recipe.strMealThumb}" class="card-img-top" alt="${recipe.strMeal}">
                <div class="card-body">
                    <h5 class="card-title">${recipe.strMeal}</h5>
                    <p class="card-text">Category: ${recipe.strCategory || 'N/A'}</p>
                    <button class="btn btn-primary view-recipe" data-id="${recipe.idMeal}">View Recipe</button>
                </div>
            </div>
        `;

        col.querySelector('.view-recipe').addEventListener('click', () => {
            getRecipeDetails(recipe.idMeal);
        });

        recipeList.appendChild(col);
    });
}

// Update Pagination
function updatePagination() {
    const totalPages = Math.ceil(currentRecipes.length / ITEMS_PER_PAGE);
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = '<a class="page-link" href="#">Previous</a>';
    prevLi.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRecipes();
            updatePagination();
        }
    });
    pagination.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${currentPage === i ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', () => {
            currentPage = i;
            displayRecipes();
            updatePagination();
        });
        pagination.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = '<a class="page-link" href="#">Next</a>';
    nextLi.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRecipes();
            updatePagination();
        }
    });
    pagination.appendChild(nextLi);
}

// Get Recipe Details
async function getRecipeDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
        const data = await response.json();
        if (data.meals && data.meals[0]) {
            showRecipeModal(data.meals[0]);
        }
    } catch (error) {
        console.error('Error getting recipe details:', error);
    }
}

// Show Recipe Modal
function showRecipeModal(recipe) {
    const modalTitle = document.querySelector('#recipeModal .modal-title');
    const modalBody = document.querySelector('#recipeModal .modal-body');

    // Get ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure} ${ingredient}`);
        }
    }

    modalTitle.textContent = recipe.strMeal;
    modalBody.innerHTML = `
        <img src="${recipe.strMealThumb}" class="img-fluid mb-3" alt="${recipe.strMeal}">
        <h5>Category: ${recipe.strCategory}</h5>
        <h5>Area: ${recipe.strArea}</h5>
        <h5>Ingredients:</h5>
        <ul>
            ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h5>Instructions:</h5>
        <p>${recipe.strInstructions}</p>
    `;

    recipeModal.show();
}

// Initialize the app
initialize();
