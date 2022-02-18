const { ITEM_TYPES, ItemStrategyManager } = require("./item_strategies")

class Item {
  constructor(name, sellIn, quality){
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

class Shop {
  constructor(items=[]){
    this.items = items;
  }

  updateQuality() {
    for (let i = 0; i < this.items.length; i++) {
      const strategy = ItemStrategyManager.getStrategy(this.items[i].name);
      const sellIn_quality = strategy.calculate(this.items[i]);
      
      this.items[i].sellIn = sellIn_quality.sellIn;
      this.items[i].quality = sellIn_quality.quality;
    }
    
    return this.items
  }
  
}

module.exports = {
  Item,
  Shop
}
