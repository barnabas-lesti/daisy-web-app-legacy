import Food from './food';

class Ingredient {
  constructor ({ amount, food }) {
    this.food = new Food(food);
    this.amount = amount || 0;
  }
}

export default class Recipe {
  static Ingredient = Ingredient;
  static Serving = Food.Serving;

  /**
   * @param {Recipe} args
   */
  constructor ({ id, userId, name, description, ingredients, serving } = {}) {
    this.id = id;
    this.userId = `${userId || ''}`;
    this.name = name;
    this.description = description;

    this.ingredients = (ingredients || []).map(item => new Ingredient(item));
    this.serving = new Food.Serving(serving);
  }
}
