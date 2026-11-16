export async function seedCategories(client) {
  console.log('  🏷️   Seeding categories...');

  await client.query(`
    INSERT INTO categories (name, slug, description, is_active, sort_order)
    VALUES
      ('Raw Honey',        'raw-honey',        'Unprocessed, natural raw honey directly from the hive.',          TRUE, 1),
      ('Forest Honey',     'forest-honey',     'Wild honey collected from forest regions of India.',              TRUE, 2),
      ('Infused Honey',    'infused-honey',    'Natural honey infused with herbs, spices and superfoods.',        TRUE, 3),
      ('Creamed Honey',    'creamed-honey',    'Smooth, spreadable honey with a rich creamy texture.',            TRUE, 4),
      ('Gift Sets',        'gift-sets',        'Curated honey gift sets for all occasions.',                      TRUE, 5)
    ON CONFLICT (slug) DO NOTHING
  `);

  console.log('     ✅  Categories seeded');
}
