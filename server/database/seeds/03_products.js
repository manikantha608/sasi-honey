export async function seedProducts(client) {
  console.log('  🍯  Seeding products & variants...');

  // Fetch category IDs
  const { rows: cats } = await client.query(
    'SELECT id, slug FROM categories'
  );
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // ── Products ─────────────────────────────────────────────────────────────
  const { rows: products } = await client.query(`
    INSERT INTO products (category_id, name, slug, description, short_desc, is_featured, is_bestseller, is_active)
    VALUES
      ($1, 'Pure Wild Forest Honey',
           'pure-wild-forest-honey',
           'Sourced from the pristine forests of Kerala, this raw wild honey is packed with natural enzymes, antioxidants and nutrients. Cold-extracted and unfiltered to preserve all its goodness.',
           'Raw, unfiltered wild honey from Kerala forests.',
           TRUE, TRUE, TRUE),
      ($2, 'Nilgiri Raw Honey',
           'nilgiri-raw-honey',
           'Single-origin raw honey from the Nilgiri hills. Light amber in colour with a mild floral taste, perfect for daily use.',
           'Single-origin honey from the Nilgiri hills.',
           FALSE, TRUE, TRUE),
      ($3, 'Turmeric Infused Honey',
           'turmeric-infused-honey',
           'A powerful blend of pure honey and organic turmeric. Great for immunity and as a natural anti-inflammatory remedy.',
           'Pure honey infused with organic turmeric.',
           TRUE, FALSE, TRUE),
      ($4, 'Cinnamon Infused Honey',
           'cinnamon-infused-honey',
           'Warm, aromatic honey blended with Ceylon cinnamon. Naturally supports blood sugar balance and digestion.',
           'Honey blended with Ceylon cinnamon.',
           FALSE, FALSE, TRUE),
      ($5, 'Classic Creamed Honey',
           'classic-creamed-honey',
           'Slow-churned to a silky smooth consistency. Spreadable, non-drip honey perfect on toast, pancakes and desserts.',
           'Smooth, spreadable creamed honey.',
           FALSE, FALSE, TRUE)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id, slug
  `, [
    catMap['forest-honey'],
    catMap['raw-honey'],
    catMap['infused-honey'],
    catMap['infused-honey'],
    catMap['creamed-honey'],
  ]);

  if (products.length === 0) {
    console.log('     ⏭   Products already seeded — skipping variants');
    return;
  }

  const productMap = Object.fromEntries(products.map((p) => [p.slug, p.id]));

  // ── Variants (250g, 500g, 1kg for each product) ────────────────────────
  const variants = [
    // Wild Forest Honey
    { slug: 'pure-wild-forest-honey', weight: 250,  label: '250g', price: 299,  mrp: 349,  sku: 'WFH-250' },
    { slug: 'pure-wild-forest-honey', weight: 500,  label: '500g', price: 549,  mrp: 649,  sku: 'WFH-500' },
    { slug: 'pure-wild-forest-honey', weight: 1000, label: '1kg',  price: 999,  mrp: 1199, sku: 'WFH-1KG' },

    // Nilgiri Raw Honey
    { slug: 'nilgiri-raw-honey', weight: 250,  label: '250g', price: 249,  mrp: 299,  sku: 'NRH-250' },
    { slug: 'nilgiri-raw-honey', weight: 500,  label: '500g', price: 449,  mrp: 549,  sku: 'NRH-500' },
    { slug: 'nilgiri-raw-honey', weight: 1000, label: '1kg',  price: 849,  mrp: 999,  sku: 'NRH-1KG' },

    // Turmeric Honey
    { slug: 'turmeric-infused-honey', weight: 250,  label: '250g', price: 349,  mrp: 399,  sku: 'TIH-250' },
    { slug: 'turmeric-infused-honey', weight: 500,  label: '500g', price: 649,  mrp: 749,  sku: 'TIH-500' },

    // Cinnamon Honey
    { slug: 'cinnamon-infused-honey', weight: 250,  label: '250g', price: 329,  mrp: 379,  sku: 'CIH-250' },
    { slug: 'cinnamon-infused-honey', weight: 500,  label: '500g', price: 599,  mrp: 699,  sku: 'CIH-500' },

    // Creamed Honey
    { slug: 'classic-creamed-honey', weight: 250,  label: '250g', price: 279,  mrp: 329,  sku: 'CCH-250' },
    { slug: 'classic-creamed-honey', weight: 500,  label: '500g', price: 499,  mrp: 599,  sku: 'CCH-500' },
  ];

  for (const v of variants) {
    await client.query(`
      INSERT INTO product_variants
        (product_id, weight_grams, label, price, mrp, sku, stock_qty, low_stock_threshold, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9)
      ON CONFLICT (sku) DO NOTHING
    `, [
      productMap[v.slug],
      v.weight,
      v.label,
      v.price,
      v.mrp,
      v.sku,
      100,
      5,
      v.weight === 250 ? 1 : v.weight === 500 ? 2 : 3,
    ]);
  }

  console.log('     ✅  Products and variants seeded');
}
