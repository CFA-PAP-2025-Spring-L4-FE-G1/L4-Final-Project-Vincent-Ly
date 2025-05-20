//GLOBAL VARIABLES
let selectedLocationId = "";

// fetch("/storeSearch") //test store search
// .then(result => {
//     console.log(result);
//     return result.json();
// })
// .then(data => console.log(data))
// .catch(err => console.error(err));

//---------------------------------------- PRODUCTS ----------------------------------------------
async function checkStock(ingred) { //
    try {
        const response = await fetch(`/check-stock?ingred=${ingred}&locationId=${selectedLocationId}`);
        const jsonData = await response.json();
        console.log(jsonData);//
        //add a red or green rectangle(just the size of the text) to show IN STOCK or OUT OF STOCK 
        const stockStatus = document.createElement('span');
        stockStatus.style.display = 'inline-block';
        stockStatus.style.padding = '3px 8px';
        stockStatus.style.marginLeft = '8px';
        stockStatus.style.borderRadius = '4px';
        stockStatus.style.fontSize = '12px';
        stockStatus.style.fontWeight = 'bold';

        if (response.status === 404) {
            console.log(`ingredient ${ingred} unavailable`);
            stockStatus.textContent = 'UNAVAILABLE';
            stockStatus.style.backgroundColor = 'red';
            stockStatus.style.color = 'white';
            return stockStatus;
        }

        if (jsonData.error) {
            console.log(`Error: ${jsonData.error}`);
            stockStatus.textContent = 'ERROR';
            stockStatus.style.backgroundColor = 'gray';
            stockStatus.style.color = 'white';
            return stockStatus;
        } else if (jsonData.data && jsonData.data.length > 0) {
            console.log(`Product found: ${jsonData.data[0].description}`);
            stockStatus.textContent = 'IN STOCK';
            stockStatus.style.backgroundColor = 'green';
            stockStatus.style.color = 'white';
            return stockStatus;
        } else {
            console.log(`Ingredient ${ingred} out of stock`);
            stockStatus.textContent = 'OUT OF STOCK';
            stockStatus.style.backgroundColor = 'red';
            stockStatus.style.color = 'white';
            return stockStatus;
        }
    } catch(err) {
        console.error('error checking stock:', err);
        const stockStatus = document.createElement('span');
        stockStatus.textContent = 'ERROR';
        stockStatus.style.backgroundColor = 'gray';
        stockStatus.style.color = 'white';
        return stockStatus;
    }
}
// checkStock("meatballs"); //uhh manual test doesnt work?

async function updateStock() { //chat
    //add locking system with boolean flaggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg
    if (!recipeDiv || recipeDiv.children.length === 0) { //if recipeDiv is empty, return
        console.log('No recipes to update stock for.');
        return;
    }

    //access recipeDiv and for each ingredient call checkStock(ingredient)
    const recipeItems = recipeDiv.querySelectorAll('.recipe ul li'); //select all and return list
    for (const item of recipeItems) {
        // Remove any existing stock status
        const existingStatus = item.querySelector('span');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Extract the ingredient name (before the parentheses)
        const ingredientText = item.textContent.split(' (')[0];
        console.log(`Checking stock for ingredient: ${ingredientText}`);//
        
        const stockStatus = await checkStock(ingredientText); //checkStock
        if (stockStatus) {
            item.appendChild(stockStatus);
        }
    }
}

//---------------------------------------- LOCATION ----------------------------------------------
const locationDiv = document.querySelector('#shown-locations');
function showLocations(locations) {
    for(let loc of locations) {
        const name = loc[0];
        const phone = loc[1];
        const address = loc[2];

        const locationElement = document.createElement('div');
        locationElement.classList.add('location', 'p-4', 'bg-indigo-50', 'rounded-lg', 'shadow', 'mb-4', 'mx-[30%]', 'mt-4');

        const nameElement = document.createElement('p');
        nameElement.textContent = name;
        nameElement.classList.add('text-lg', 'font-bold', 'mt-2');
        locationElement.appendChild(nameElement);

        const phoneElement = document.createElement('p');
        phoneElement.textContent = phone;
        phoneElement.classList.add('text-sm', 'text-gray-600', 'mt-2');
        locationElement.appendChild(phoneElement);

        const addressElement = document.createElement('p');
        addressElement.textContent = address.addressLine1;
        addressElement.classList.add('text-sm', 'text-gray-600', 'mt-2');
        locationElement.appendChild(addressElement);

        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select Location';
        selectButton.classList.add('bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded', 'mt-4', 'hover:bg-blue-600', 'mx-auto');
        selectButton.addEventListener('click', () => {
            console.log(`Selected location: ${name}`);
            selectedLocationId = loc[3];

            //remove selected color from all buttons
            const allButtons = document.querySelectorAll('.location button');
            allButtons.forEach(button => {
                button.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
                button.classList.add('bg-blue-500', 'hover:bg-blue-600');
            });

            //add selected color to the selected button
            selectButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            selectButton.classList.add('bg-yellow-500', 'hover:bg-yellow-600');

            updateStock(); //update ingredients stock 
        });
        //create a container for the button to flex center it
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('flex', 'justify-center', 'mt-4');
        buttonContainer.appendChild(selectButton)
        locationElement.appendChild(buttonContainer);

        locationDiv.appendChild(locationElement);
    }
}

async function getLocations(zip) {
    try {
        // locParams.url += zip;
        // let response = await fetch(locationAPIURL + zip, locParams); //??
        const response = await fetch(`/storeSearch?zip=${zip}`); // Fetch the data
        console.log(response); //
        const jsonData = await response.json();
        console.log(jsonData.data); //

        const result = [];
        for(let i = 0; i < Math.min(5, jsonData.data.length); i++) { //show top 5 closest locations
            const location = jsonData.data[i];
            const resultItem = [];

            console.log("pushing ", location.name); //
            resultItem.push(location.name);

            console.log("pushing ", location.phone); //
            resultItem.push(location.phone);

            console.log("pushing ", location.address); //
            resultItem.push(location.address);

            console.log("pushing ", location.locationId); //
            resultItem.push(location.locationId);

            result.push(resultItem);
        }
        return result;
    } catch (err) {
        console.error(err);
        throw err; // Rethrow the error to handle it in the caller ?ok
    }
}

const zipInput = document.querySelector('#zip-input');
zipInput.addEventListener('keypress', async (event) => {
    if(event.key === 'Enter') {
        let inputedZip = zipInput.value;
        console.log('user entered zip:', inputedZip);//
        try {
            locationDiv.innerHTML = ''; //clear previous locations
            let locations = await getLocations(inputedZip);
            showLocations(locations);
        } catch(err) {
            console.error('error fetching locations:', err);
        }
    }
});

//----------------------------------------- RECIPE -----------------------------------------------
let recipeAPIURL = "https://www.themealdb.com/api/json/v1/1/search.php?s="
const recParams = {
    method: 'GET'
}

const recipeDiv = document.querySelector('#shown-recipes');
function showRecipes(meals) {
    //meals(array)
    //  recipe(array)
    //      img(str), name(str), instrucs(str), ingreds(array), measures(array)
    //  ...
    for(let meal of meals) {
        const name = meal[0];
        const img = meal[1];
        const instrucs = meal[2];
        const ingreds = meal[3];
        const measures = meal[4];

        const recipeElement = document.createElement('div');
        recipeElement.classList.add('recipe', 'p-4', 'bg-indigo-50', 'rounded-lg', 'shadow', 'mb-4', 'mx-[10%]', 'mt-4');

        const imgElement = document.createElement('img');
        imgElement.src = img;
        imgElement.alt = name;
        imgElement.classList.add('w-[30%]', 'h-auto', 'rounded', 'mx-auto');
        recipeElement.appendChild(imgElement);

        const nameElement = document.createElement('p'); //name
        nameElement.textContent = name;
        nameElement.classList.add('text-lg', 'font-bold', 'mt-2');
        recipeElement.appendChild(nameElement);

        const instrucsElement = document.createElement('p'); //instrucs
        // Split the instructions by "STEP"
        const steps = instrucs.split('STEP').map((step, index) => {
            if (index === 0 && step.trim() === '') return ''; // Skip the first empty part if it exists
            const formattedStep = step
                .trim()
                .split('.')
                .map(sentence => sentence.trim())
                .filter(sentence => sentence) // Remove empty sentences
                .join('.<br>'); // Add line breaks between sentences
            return `STEP ${formattedStep}`;
        });
        // Join the steps with extra line breaks between them
        const formattedInstrucs = steps.filter(step => step).join('<br><br>');
        // Use innerHTML to include the line breaks
        instrucsElement.innerHTML = formattedInstrucs;
        instrucsElement.classList.add('text-sm', 'text-gray-600', 'mt-2');
        recipeElement.appendChild(instrucsElement);

        const ingredsList = document.createElement('ul'); //ingreds and measures
        ingredsList.classList.add('list-disc', 'list-inside', 'mt-2');
        for(let i = 0; i < ingreds.length; i++) {
            const ingredItem = document.createElement('li');
            ingredItem.textContent = ingreds[i];
            ingredItem.textContent += ` (${measures[i]})`;
            ingredsList.appendChild(ingredItem);
        }
        recipeElement.appendChild(ingredsList);
        
        recipeDiv.appendChild(recipeElement);
    }
    if(selectedLocationId != "") {
        updateStock();
    }
}

async function getRecipes(search) {
    try {
        let response = await fetch(recipeAPIURL + search, recParams);
        let data = await response.json();
        console.log(data);
        console.log(response.status);

        const result = [];
        for(let meal of data.meals) {
            const resultItem = []; //this will contain the meal name, instrucs, ingreds, measures

            const mealName = meal.strMeal;
            console.log(mealName);//
            resultItem.push(mealName);

            const mealImage = meal.strMealThumb;
            resultItem.push(mealImage);

            const mealInstructions = meal.strInstructions;
            resultItem.push(mealInstructions);

            const mealIngredients = [];
            for(let i = 1; i < 21; i++) { //stop at 21, why again?
                const ingred = "strIngredient" + i;

                if(meal[ingred] === null || meal[ingred] === "") {
                    console.log("stop at", i);//
                    break;
                } else {
                    console.log("pushing ", meal[ingred]);//
                    mealIngredients.push(meal[ingred]);
                }
            }
            resultItem.push(mealIngredients);

            const mealMeasures = [];
            for(let i = 1; i < 21; i++) {
                const measure = "strMeasure" + i;

                if(meal[measure] === null || meal[measure] === "") {
                    break;
                } else {
                    console.log("pushing ", meal[measure]);//
                    mealMeasures.push(meal[measure]);
                }
            }
            resultItem.push(mealMeasures);

            result.push(resultItem);
        }
        return result;
    }
    catch(error) {
        console.error(error);
    }
}

const recipeInput = document.querySelector('#recipe-input'); //search bar
recipeInput.addEventListener('keypress', async (event) => {
    if(event.key === 'Enter') {
        let searchedFood = recipeInput.value;
        console.log('user pressed enter:', searchedFood);//
        try {
            recipeDiv.innerHTML = ''; //clear previous recipes
            let meals = await getRecipes(searchedFood);
            showRecipes(meals);
        } catch(error) {
            console.error('error fetching recipes:', error);
        }
    }
});