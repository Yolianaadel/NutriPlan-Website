export class MealAPI {
  constructor() {
    this.baseURL = 'https://www.themealdb.com/api/json/v1/1';
  }

  async getRandomMeals(count = 25) {
    try {
      let meals = [];
      let promises = [];
      
      for (let i = 0; i < count; i++) {
        promises.push(
          fetch(`${this.baseURL}/random.php`)
            .then(res => res.json())
            .then(data => data.meals[0])
        );
      }
      
      let results = await Promise.all(promises);
      return results.filter(meal => meal !== null);
    } catch (error) {
      console.error('Error fetching random meals:', error);
      return [];
    }
  }

  async getMealById(mealId) {
    try {
      let response = await fetch(`${this.baseURL}/lookup.php?i=${mealId}`);
      let data = await response.json();
      return data.meals && data.meals.length > 0 ? data.meals[0] : null;
    } catch (error) {
      console.error('Error fetching meal by ID:', error);
      return null;
    }
  }

  async searchMealsByName(name) {
    try {
      let response = await fetch(`${this.baseURL}/search.php?s=${encodeURIComponent(name)}`);
      let data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error searching meals:', error);
      return [];
    }
  }

  async filterByCategory(category) {
    try {
      let response = await fetch(`${this.baseURL}/filter.php?c=${encodeURIComponent(category)}`);
      let data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error filtering by category:', error);
      return [];
    }
  }

  async filterByArea(area) {
    try {
      let response = await fetch(`${this.baseURL}/filter.php?a=${encodeURIComponent(area)}`);
      let data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error filtering by area:', error);
      return [];
    }
  }

  async getCategories() {
    try {
      let response = await fetch(`${this.baseURL}/list.php?c=list`);
      let data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getAreas() {
    try {
      let response = await fetch(`${this.baseURL}/list.php?a=list`);
      let data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
  }
}
