const {Shop, Item} = require("../src/gilded_rose");
const { ITEM_TYPES } = require("../src/item_strategies");

describe("Gilded Rose", function() {
  it("should foo", function() {
    const gildedRose = new Shop([new Item("foo", 0, 0)]);
    const items = gildedRose.updateQuality();
    expect(items[0].name).toBe("foo");
  });

  describe("Test updateQuality() for the given requirements", function() {

    const item_names = {
      decreasing_item_names: [
        "foo",
        ITEM_TYPES.CONJURED
      ],
      increasing_item_names: [
        ITEM_TYPES.AGED_BRIE,
        ITEM_TYPES.BACKSTAGE,
      ]
    };

    it("General: quality and SellIn lowers every day", function(){
      const sellIn = 10, quality = 12

      const gildedRose = new Shop([new Item("foo", sellIn, quality)]);
      const items = gildedRose.updateQuality();

      expect(items[0].sellIn).toBeLessThan(sellIn)
      expect(items[0].quality).toBeLessThan(quality)
    });

    it("General: when sellIn passed, quality degrades twice as fast", function() {
      const quality = 10;

      const gildedRose = new Shop(item_names.decreasing_item_names.map(name => new Item(name, 10, quality)));
      const gildedRose_0 = new Shop(item_names.decreasing_item_names.map(name => new Item(name, 0, quality)));

      const items   = gildedRose.updateQuality();
      const items_0 = gildedRose_0.updateQuality();

      expect(items.length).toBeGreaterThan(0);

      for (let i = 0; i < items.length; i++) {
        const unexpired_decrease = quality - items[i].quality;
        const expired_decrease   = quality - items_0[i].quality;
        expect(expired_decrease).toBe(unexpired_decrease * 2);
      }
    });

    it("General: quality of an item is never negative", function() {
      const gildedRose = new Shop(item_names.decreasing_item_names.map(name => new Item(name, 0, 0)));
      const items = gildedRose.updateQuality();

      expect(items.length).toBeGreaterThan(0);

      items.forEach(item => expect(item.quality).toBeGreaterThanOrEqual(0));
    });

    it("Aged Brie: increases in quality the older it gets", function() {
      const quality = 10;

      const gildedRose = new Shop([new Item(ITEM_TYPES.AGED_BRIE, 5, quality)]);
      const items = gildedRose.updateQuality();

      expect(items[0].quality).toBeGreaterThan(quality);
    });
    
    it("General: quality of an item is never more than 50", function() {
      const gildedRose = new Shop(item_names.increasing_item_names.map(name => new Item(name, 10, 50)));
      const items = gildedRose.updateQuality();

      expect(items.length).toBeGreaterThan(0);

      items.forEach(item => expect(item.quality).toBe(50));
    });
    
    it("Sullfuras: never has to be sold or decreases in quality", function() {
      const sellIn = 10, quality = 10;

      const gildedRose = new Shop([new Item(ITEM_TYPES.SULFURAS, sellIn, quality)]);
      const items = gildedRose.updateQuality();

      expect(items[0].sellIn).toBe(sellIn);
      expect(items[0].quality).toBe(quality);
    });
    
    it("Backstage passes: increases in quality as the selling value approaches", function() {
      const sellIns = [15, 10, 5, 0], quality = 10;
      let items = sellIns.map(sellIn => new Item(ITEM_TYPES.BACKSTAGE, sellIn, quality));
      const expected_quality = sellIns.map(sellIn => {
        
        if (sellIn <= 0)
          return 0;
        else if (sellIn <= 5)
          return quality + 3;
        else if (sellIn <= 10)
          return quality + 2;
        else if (sellIn > 10)
          return quality + 1;
      });

      const gildedRose = new Shop(items);
      items = gildedRose.updateQuality();

      expect(items.length).toBeGreaterThan(0);

      for (let i = 0; i < sellIns.length; i++) {
        expect(items[i].quality).toBe(expected_quality[i])
      }
    });

    it("Conjured: quality degrades twice as fast as normal items", function() {
      const quality = 10;

      const gildedRose = new Shop([
        new Item("foo", 10, quality), // normal item
        new Item(ITEM_TYPES.CONJURED, 10, quality) // conjured item
      ]);
      items = gildedRose.updateQuality();

      const normal_decrease = quality - items[0].quality;
      const conjured_decrease = quality - items[1].quality;

      expect(conjured_decrease).toBe(normal_decrease * 2);
    });

  });
});
