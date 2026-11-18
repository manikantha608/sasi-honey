/**
 * Focused seed: categories + products + variants only.
 * Usage: node database/seeds/seed-products.mjs
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Raw Honey',     slug: 'raw-honey',     description: 'Unprocessed, natural honey directly from the hive.',          sort: 1 },
  { name: 'Forest Honey',  slug: 'forest-honey',  description: 'Wild honey collected from forest regions of India.',           sort: 2 },
  { name: 'Infused Honey', slug: 'infused-honey', description: 'Natural honey infused with herbs, spices and superfoods.',     sort: 3 },
  { name: 'Creamed Honey', slug: 'creamed-honey', description: 'Smooth, spreadable honey with a rich creamy texture.',         sort: 4 },
  { name: 'Gift Sets',     slug: 'gift-sets',     description: 'Curated honey gift sets for all occasions.',                   sort: 5 },
];

// ─── Products ─────────────────────────────────────────────────────────────────
// category: must match a slug from CATEGORIES
const PRODUCTS = [
  {
    category: 'forest-honey',
    name: 'Pure Wild Forest Honey',
    slug: 'pure-wild-forest-honey',
    shortDesc: 'Raw, unfiltered wild honey from Kerala forests.',
    description: `Sourced from the pristine forests of Kerala, this raw wild honey is packed with natural enzymes, antioxidants and nutrients. Cold-extracted and unfiltered to preserve all its goodness.\n\nEach batch is harvested by tribal beekeepers who have practised traditional honey collection for generations. The result is a truly authentic forest honey with complex, earthy flavour notes.`,
    isFeatured: true,
    isBestseller: true,
    variants: [
      { weight: 250,  label: '250g', price: 299,  mrp: 349,  sku: 'WFH-250', stock: 100 },
      { weight: 500,  label: '500g', price: 549,  mrp: 649,  sku: 'WFH-500', stock: 80  },
      { weight: 1000, label: '1kg',  price: 999,  mrp: 1199, sku: 'WFH-1KG', stock: 50  },
    ],
  },
  {
    category: 'raw-honey',
    name: 'Nilgiri Raw Honey',
    slug: 'nilgiri-raw-honey',
    shortDesc: 'Single-origin honey from the Nilgiri hills.',
    description: `Single-origin raw honey from the Nilgiri hills of Tamil Nadu. Light amber in colour with a mild floral taste, perfect for daily use in tea, on toast or straight from the spoon.\n\nMinimally processed — only strained, never heated — to retain all the natural pollen, enzymes and minerals.`,
    isFeatured: false,
    isBestseller: true,
    variants: [
      { weight: 250,  label: '250g', price: 249,  mrp: 299,  sku: 'NRH-250', stock: 120 },
      { weight: 500,  label: '500g', price: 449,  mrp: 549,  sku: 'NRH-500', stock: 90  },
      { weight: 1000, label: '1kg',  price: 849,  mrp: 999,  sku: 'NRH-1KG', stock: 60  },
    ],
  },
  {
    category: 'infused-honey',
    name: 'Turmeric Infused Honey',
    slug: 'turmeric-infused-honey',
    shortDesc: 'Pure honey infused with organic turmeric.',
    description: `A powerful blend of pure honey and organic turmeric. Great for immunity and as a natural anti-inflammatory remedy.\n\nTurmeric provides curcumin, nature's most potent anti-inflammatory, while honey acts as a natural preservative and sweetener. Together, they form a golden elixir for everyday wellness.`,
    isFeatured: true,
    isBestseller: false,
    variants: [
      { weight: 250, label: '250g', price: 349, mrp: 399, sku: 'TIH-250', stock: 75 },
      { weight: 500, label: '500g', price: 649, mrp: 749, sku: 'TIH-500', stock: 50 },
    ],
  },
  {
    category: 'infused-honey',
    name: 'Cinnamon Infused Honey',
    slug: 'cinnamon-infused-honey',
    shortDesc: 'Honey blended with Ceylon cinnamon.',
    description: `Warm, aromatic honey blended with genuine Ceylon cinnamon. Naturally supports blood sugar balance and digestion.\n\nUse as a spread on toast, stir into warm milk or add to your morning oats. The gentle warmth of cinnamon complements the sweetness of pure honey beautifully.`,
    isFeatured: false,
    isBestseller: false,
    variants: [
      { weight: 250, label: '250g', price: 329, mrp: 379, sku: 'CIH-250', stock: 60 },
      { weight: 500, label: '500g', price: 599, mrp: 699, sku: 'CIH-500', stock: 40 },
    ],
  },
  {
    category: 'creamed-honey',
    name: 'Classic Creamed Honey',
    slug: 'classic-creamed-honey',
    shortDesc: 'Smooth, spreadable creamed honey.',
    description: `Slow-churned to a silky smooth consistency. Spreadable, non-drip honey perfect on toast, pancakes and desserts.\n\nCreamed honey is made by controlling the crystallisation process — the result is a fine-grained, satiny texture that stays spreadable at room temperature. Same nutrients as liquid honey, just in a more convenient form.`,
    isFeatured: false,
    isBestseller: false,
    variants: [
      { weight: 250, label: '250g', price: 279, mrp: 329, sku: 'CCH-250', stock: 90 },
      { weight: 500, label: '500g', price: 499, mrp: 599, sku: 'CCH-500', stock: 70 },
    ],
  },
  {
    category: 'raw-honey',
    name: 'Sundarban Mangrove Honey',
    slug: 'sundarban-mangrove-honey',
    shortDesc: 'Rare honey from the Sundarbans mangrove forests.',
    description: `One of the rarest honey varieties in India — collected from wild bee colonies in the Sundarbans mangrove delta of West Bengal.\n\nDark amber with a rich, robust flavour and a slightly salty undertone from the mangrove blossoms. Collected by the Mawali honey hunters using generations-old traditional methods.`,
    isFeatured: true,
    isBestseller: false,
    variants: [
      { weight: 250,  label: '250g', price: 399,  mrp: 449,  sku: 'SMH-250', stock: 40 },
      { weight: 500,  label: '500g', price: 749,  mrp: 849,  sku: 'SMH-500', stock: 25 },
      { weight: 1000, label: '1kg',  price: 1399, mrp: 1599, sku: 'SMH-1KG', stock: 15 },
    ],
  },
  {
    category: 'infused-honey',
    name: 'Ginger Lemon Honey',
    slug: 'ginger-lemon-honey',
    shortDesc: 'Honey with ginger and lemon — perfect for immunity.',
    description: `A zesty, warming blend of pure raw honey, fresh ginger extract and dried lemon zest. Perfect for sore throats, cold mornings and immunity support.\n\nTake a spoonful straight, stir into hot water as a tea, or use as a salad dressing. A must-have in every kitchen.`,
    isFeatured: false,
    isBestseller: true,
    variants: [
      { weight: 250, label: '250g', price: 299, mrp: 349, sku: 'GLH-250', stock: 85 },
      { weight: 500, label: '500g', price: 549, mrp: 649, sku: 'GLH-500', stock: 55 },
    ],
  },
  {
    category: 'gift-sets',
    name: 'Honey Trio Gift Box',
    slug: 'honey-trio-gift-box',
    shortDesc: 'A curated set of 3 premium honey varieties.',
    description: `The perfect gift — a beautifully packaged box containing three 250g jars of our best-loved honey varieties: Pure Wild Forest Honey, Nilgiri Raw Honey and Turmeric Infused Honey.\n\nComes in a premium kraft box with a handwritten card. Ideal for weddings, festivals, housewarming and corporate gifting.`,
    isFeatured: true,
    isBestseller: true,
    variants: [
      { weight: 750, label: '3 × 250g', price: 849, mrp: 999, sku: 'HTG-750', stock: 30 },
    ],
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
async function run() {
  const client = await pool.connect();
  try {
    console.log('\n🌱  Seeding categories and products...\n');

    // ── Categories ──────────────────────────────────────────────────────────
    console.log('🏷️   Inserting categories...');
    let catInserted = 0;
    for (const cat of CATEGORIES) {
      const { rowCount } = await client.query(`
        INSERT INTO categories (name, slug, description, is_active, sort_order)
        VALUES ($1, $2, $3, TRUE, $4)
        ON CONFLICT (slug) DO UPDATE SET
          name        = EXCLUDED.name,
          description = EXCLUDED.description,
          sort_order  = EXCLUDED.sort_order,
          updated_at  = NOW()
      `, [cat.name, cat.slug, cat.description, cat.sort]);
      catInserted++;
      console.log(`   ✅  ${cat.name}`);
    }

    // Build category slug → id map
    const { rows: catRows } = await client.query('SELECT id, slug FROM categories');
    const catMap = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

    // ── Products + Variants ─────────────────────────────────────────────────
    console.log('\n🍯  Inserting products and variants...');
    let prodInserted = 0;
    let varInserted  = 0;

    for (const p of PRODUCTS) {
      const categoryId = catMap[p.category];
      if (!categoryId) {
        console.warn(`   ⚠️  Category "${p.category}" not found — skipping ${p.name}`);
        continue;
      }

      // Upsert product
      const { rows: [product] } = await client.query(`
        INSERT INTO products
          (category_id, name, slug, description, short_desc, is_featured, is_bestseller, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        ON CONFLICT (slug) DO UPDATE SET
          category_id  = EXCLUDED.category_id,
          name         = EXCLUDED.name,
          description  = EXCLUDED.description,
          short_desc   = EXCLUDED.short_desc,
          is_featured  = EXCLUDED.is_featured,
          is_bestseller= EXCLUDED.is_bestseller,
          updated_at   = NOW()
        RETURNING id
      `, [categoryId, p.name, p.slug, p.description, p.shortDesc, p.isFeatured, p.isBestseller]);

      prodInserted++;

      // Upsert variants
      let varOrder = 1;
      for (const v of p.variants) {
        await client.query(`
          INSERT INTO product_variants
            (product_id, weight_grams, label, price, mrp, sku, stock_qty, low_stock_threshold, is_active, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 5, TRUE, $8)
          ON CONFLICT (sku) DO UPDATE SET
            price      = EXCLUDED.price,
            mrp        = EXCLUDED.mrp,
            stock_qty  = EXCLUDED.stock_qty,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW()
        `, [product.id, v.weight, v.label, v.price, v.mrp, v.sku, v.stock, varOrder++]);
        varInserted++;
      }

      console.log(`   ✅  ${p.name}  (${p.variants.length} variant${p.variants.length > 1 ? 's' : ''})`);
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(45)}`);
    console.log(`  Categories : ${catInserted}`);
    console.log(`  Products   : ${prodInserted}`);
    console.log(`  Variants   : ${varInserted}`);
    console.log(`${'─'.repeat(45)}`);
    console.log('\n🎉  Done!\n');

  } catch (err) {
    console.error('\n❌  Seed error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
