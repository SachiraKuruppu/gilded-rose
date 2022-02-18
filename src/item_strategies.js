// item_strategies.ja
//
// Implement strategies to update the sellIn and quality of items. Uses the Strategy design pattern.

const ITEM_TYPES = {
    AGED_BRIE: "Aged Brie",
    BACKSTAGE: "Backstage passes to a TAFKAL80ETC concert",
    SULFURAS: "Sulfuras, Hand of Ragnaros",
    CONJURED: "Conjured"
}

const MIN_SELL_IN = 0;
const MIN_QUALITY = 0;
const MAX_QUALITY = 50;

const NORMAL_QUALITY_RATE = 1

// Blueprint strategy class.
// sellIn_fn(item) = return the new sellIn value.
// quality_fn(item) = return the new quality value.
class SellInQualityStrategy {
    constructor(name, sellIn_fn, quality_fn) {
        this.name = name;
        this._sellIn_fn = sellIn_fn;
        this._quality_fn = quality_fn;
    }

    calculate(item) {
        return {
            sellIn: this._sellIn_fn(item),
            quality: this._quality_fn(item)
        };
    }
}

// ItemStrategyManager
// Contains the different strategies for different item types.
// _default_strategy is used for general (non special case) items.
ItemStrategyManager = {
    _strategies: [],
    _default_strategy: undefined,

    addStrategy(strategy, isDefault=false) {
        if (isDefault && this._default_strategy !== undefined)
            throw "Default strategy already defined.";

        if (isDefault)
            this._default_strategy = strategy
        else
            this._strategies.push(strategy);
    },

    getStrategy(name) {
        const strategy = this._strategies.find(strategy => strategy.name === name);
        if (strategy === undefined) {
            if (this._default_strategy === undefined)
                throw "Default strategy undefined."
            
            return this._default_strategy;
        }
            
        return strategy;
    }
};

// Default strategy
ItemStrategyManager.addStrategy(new SellInQualityStrategy(
    "default",
    item => Math.max(item.sellIn - 1, MIN_SELL_IN), 
    item => Math.max(item.sellIn > 0 ? item.quality - NORMAL_QUALITY_RATE : item.quality - (NORMAL_QUALITY_RATE * 2), MIN_QUALITY)
), true);

// Aged Brie: Increases in quality, older it gets.
// quality capped at MAX_QUALITY.
ItemStrategyManager.addStrategy(new SellInQualityStrategy(
    ITEM_TYPES.AGED_BRIE,
    item => Math.max(item.sellIn - 1, MIN_SELL_IN),
    item => Math.min(item.quality + NORMAL_QUALITY_RATE, MAX_QUALITY)
));

// Backstage: Quality increases with time. Quality + 2 which sellIn < 10,
// Quality + 3 when sellIn < 5, quality 0 after concert.
ItemStrategyManager.addStrategy(new SellInQualityStrategy(
    ITEM_TYPES.BACKSTAGE,
    item => Math.max(item.sellIn - 1, MIN_SELL_IN),
    (item) => {
        let increase = NORMAL_QUALITY_RATE;

        if (item.sellIn == 0)
            return 0;
        else if (item.sellIn <= 5)
            increase = 3;
        else if (item.sellIn <= 10)
            increase = 2;

        return Math.min(item.quality + increase, MAX_QUALITY);
    }
));

// Sulfuras: don't have to be sold or decreases in quality.
ItemStrategyManager.addStrategy(new SellInQualityStrategy(
    ITEM_TYPES.SULFURAS,
    item => item.sellIn,
    item => item.quality
));

// Conjured: quality degrades twice as fast as normal items
ItemStrategyManager.addStrategy(new SellInQualityStrategy(
    ITEM_TYPES.CONJURED,
    item => Math.max(item.sellIn - 1, MIN_SELL_IN),
    item => Math.max(item.sellIn > 0 ? item.quality - (NORMAL_QUALITY_RATE * 2) : item.quality - (NORMAL_QUALITY_RATE * 4), MIN_QUALITY)
));

module.exports = {
    ITEM_TYPES,
    ItemStrategyManager
}