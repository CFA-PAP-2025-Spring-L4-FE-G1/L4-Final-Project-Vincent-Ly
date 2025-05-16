//GLOBAL VARIABLES
let access_token = ""
let zip_code = 70100688 //TEMP

fetch("https://cors-anywhere.herokuapp.com/https://api-ce.kroger.com/v1/locations?filter.zipCode.near=98037", {
headers: {
    "Accept": "application/json",
    "Authorization": `Bearer ${access_token}`
}
})
.then(result => result.json())
.then(data => console.log(data))
.catch(err => console.error(err));


//LOCATION. hide input and display locations once zip code entered.
//TODO


//RECIPE
let recipeAPIURL = "https://cors-anywhere.herokuapp.com/www.themealdb.com/api/json/v1/1/search.php?s="
const params = {
    method: 'GET',
    headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${access_token}`
    }
}

function showRecipes(meals) {

}

async function getRecipes(search) {
    try {
        let response = await fetch(recipeAPIURL + search, params);
        let data = await response.json();
        console.log(data);
        console.log(response.status);

        let result = [];
        for(let meal of data.meals) {
            let resultItem = [];
            let mealName = meal.strMeal;
            console.log(mealName);//
            let mealInstructions = meal.strInstructions;
            console.log(mealInstructions);//
            let mealIngredients = [];
            for(let i = 1; i < Number.MAX_SAFE_INTEGER; i++) {
                let ingred = strIngredient + i.toString();
                console.log(ingred);//
                if(meal.ingred != null) {
                    console.log("stop at", i);//
                    break;
                } else {

                    mealIngredients.push(meal.ingred);
                }
            }
        }
        return result;
    }
    catch(error) {
        console.error(error);
    }
}

const recipeInput = document.querySelector('#recipe-input'); //search bar
recipeInput.addEventListener('keypress', (event) => {
    if(event.key === 'Enter') {
        let searchedFood = recipeInput.value;
        console.log('user pressed enter:', searchedFood);//
        showRecipes(getRecipes(searchedFood));
    }
});