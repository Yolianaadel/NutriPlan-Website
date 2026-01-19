export class Meal {
  constructor(data) {
    this.id = data.idMeal || data.id || null;
    this.name = data.strMeal || data.name || '';
    this.category = data.strCategory || data.category || '';
    this.area = data.strArea || data.area || '';
    this.instructions = data.strInstructions || data.instructions || '';
    this.image = data.strMealThumb || data.image || '';
    this.video = data.strYoutube ? this.extractVideoId(data.strYoutube) : null;
    this.tags = data.strTags ? data.strTags.split(',') : [];
    this.ingredients = this.parseIngredients(data);

    this.nutrition = null;
  }

  parseIngredients(data) {
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
      let ingredient = data[`strIngredient${i}`];
      let measure = data[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: (measure || '').trim()
        });
      }
    }
    return ingredients;
  }


  extractVideoId(url) {
    let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }

  toFoodLogEntry() {
    return {
      id: `meal_${this.id}_${Date.now()}`,
      type: 'meal',
      name: this.name,
      image: this.image,
      nutrition: this.nutrition,
      date: new Date().toISOString().split('T')[0]
    };
  }
}
