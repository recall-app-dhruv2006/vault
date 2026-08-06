/**
 * Demo/dev seed script. Creates (or reuses) a clearly-marked demo account
 * with realistic, entirely fictional saved items so the product is
 * immediately understandable without manual data entry.
 *
 * Usage:  npm run seed
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (and,
 * optionally, EMBEDDING_API_KEY for real embeddings — falls back to a
 * deterministic local embedding otherwise, which is enough for demoing
 * exact-ish keyword search but not true semantic search).
 *
 * Demo data is fully separated from real user data via `profiles.is_demo`.
 * Never mix fabricated content into a production seed.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { generateEmbeddings, chunkText } from "../lib/ai/generate-embedding";
import type { Database } from "../types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_EMAIL = "demo@vault.app";
const DEMO_PASSWORD = "VaultDemo123!";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

type SeedItem = {
  title: string;
  summary: string;
  itemType: "link" | "image" | "note" | "pdf" | "receipt";
  category: string;
  tags: string[];
  sourceUrl?: string;
  sourceDomain?: string;
  rawText: string;
  searchableText: string;
  createdDaysAgo: number;
  isFavorite?: boolean;
  receipt?: {
    merchant: string;
    total: number;
    purchaseDaysAgo: number;
    returnInDays: number | null;
    orderNumber: string;
  };
};

const SEED_ITEMS: SeedItem[] = [
  {
    title: "Gloss Black 20\" Audi Wheel — OES Wheels",
    summary: "Product page for a gloss-black 20-inch multi-spoke Audi wheel, priced at $289 per wheel, from OES Wheels.",
    itemType: "image",
    category: "product",
    tags: ["car mods", "wheels", "audi"],
    rawText: "Screenshot of an OES Wheels product page showing a gloss-black 20-inch Audi wheel with a multi-spoke design, priced at $289.",
    searchableText: "gloss black 20 inch Audi wheel multi-spoke rim OES Wheels $289 car mod aftermarket wheel",
    createdDaysAgo: 34,
  },
  {
    title: "The Standard Spa, Miami Beach",
    summary: "Boutique hotel on Miami Beach with a rooftop pool overlooking Biscayne Bay. Saved while planning a March trip.",
    itemType: "link",
    category: "travel",
    tags: ["miami", "hotel", "travel"],
    sourceUrl: "https://www.standardhotels.com/miami",
    sourceDomain: "standardhotels.com",
    rawText: "The Standard Spa Miami Beach is a boutique hotel featuring a rooftop pool with views of Biscayne Bay, a full-service spa, and waterfront dining.",
    searchableText: "Standard Spa Miami Beach hotel rooftop pool Biscayne Bay spa waterfront travel booking",
    createdDaysAgo: 21,
    isFavorite: true,
  },
  {
    title: "One-Pan Chicken Pasta",
    summary: "A creamy one-pan chicken pasta recipe with sun-dried tomatoes and spinach, ready in 30 minutes.",
    itemType: "link",
    category: "recipe",
    tags: ["recipe", "dinner", "pasta"],
    sourceUrl: "https://www.example-recipes.com/one-pan-chicken-pasta",
    sourceDomain: "example-recipes.com",
    rawText: "One-pan chicken pasta with sun-dried tomatoes, spinach, and a creamy parmesan sauce. Total time: 30 minutes. Serves 4.",
    searchableText: "chicken pasta recipe creamy sun-dried tomato spinach parmesan one pan dinner 30 minutes",
    createdDaysAgo: 12,
  },
  {
    title: "27\" 4K Monitor — Order Confirmation",
    summary: "Receipt for a 27-inch 4K monitor purchased from TechStore, total $412.99, with a 30-day return window.",
    itemType: "receipt",
    category: "receipt",
    tags: ["receipt", "electronics"],
    rawText: "TechStore order confirmation. 27-inch 4K IPS Monitor. Order #TS-88213. Total: $412.99. Return window: 30 days from delivery.",
    searchableText: "27 inch 4K monitor receipt TechStore order confirmation electronics purchase return window",
    createdDaysAgo: 9,
    receipt: { merchant: "TechStore", total: 412.99, purchaseDaysAgo: 9, returnInDays: 21, orderNumber: "TS-88213" },
  },
  {
    title: "BIO 210 — Cellular Respiration Lecture Slides",
    summary: "Lecture slides covering glycolysis, the Krebs cycle, and oxidative phosphorylation for the upcoming biology exam.",
    itemType: "pdf",
    category: "document",
    tags: ["school", "biology", "exam"],
    rawText: "Cellular Respiration: Glycolysis, Krebs Cycle, and Oxidative Phosphorylation. Lecture 14, BIO 210. Includes diagrams of the electron transport chain and ATP synthase.",
    searchableText: "biology lecture cellular respiration glycolysis krebs cycle oxidative phosphorylation exam study BIO 210",
    createdDaysAgo: 6,
  },
  {
    title: "Altitude — Rooftop Restaurant, Pittsburgh",
    summary: "Rooftop restaurant in downtown Pittsburgh with skyline views and outdoor seating, known for small plates.",
    itemType: "link",
    category: "restaurant",
    tags: ["pittsburgh", "restaurant", "rooftop"],
    sourceUrl: "https://www.example-dining.com/altitude-pittsburgh",
    sourceDomain: "example-dining.com",
    rawText: "Altitude Rooftop is a downtown Pittsburgh restaurant with skyline views, outdoor seating, and a small-plates menu. Reservations recommended.",
    searchableText: "Altitude rooftop restaurant Pittsburgh downtown skyline outdoor seating small plates dining reservation",
    createdDaysAgo: 45,
  },
  {
    title: "Men's Insulated Winter Jacket — Navy",
    summary: "Navy insulated winter jacket, water-resistant shell, priced at $118, from an outdoor apparel retailer.",
    itemType: "image",
    category: "product",
    tags: ["shopping", "winter", "jacket"],
    rawText: "Screenshot of a product listing for a navy insulated winter jacket with a water-resistant shell, priced at $118.",
    searchableText: "navy insulated winter jacket water resistant shell $118 outdoor apparel shopping product",
    createdDaysAgo: 15,
  },
  {
    title: "Japan: A Two-Week Itinerary",
    summary: "Travel article outlining a two-week Japan itinerary covering Tokyo, Kyoto, and Osaka.",
    itemType: "link",
    category: "travel",
    tags: ["japan", "travel", "itinerary"],
    sourceUrl: "https://www.example-travel.com/japan-two-week-itinerary",
    sourceDomain: "example-travel.com",
    rawText: "A detailed two-week Japan itinerary covering Tokyo, Kyoto, and Osaka, with suggestions for day trips, food, and transit passes.",
    searchableText: "Japan two week itinerary Tokyo Kyoto Osaka travel guide day trips transit pass",
    createdDaysAgo: 60,
  },
  {
    title: "Dorm Room Layout Ideas",
    summary: "Personal note with sketches and ideas for organizing a small dorm room, including loft bed and desk placement.",
    itemType: "note",
    category: "note",
    tags: ["dorm", "ideas", "school"],
    rawText: "Dorm layout ideas: loft the bed to free up floor space, put the desk under the window for natural light, use a rolling cart for extra storage. Look into command hooks for the closet.",
    searchableText: "dorm room layout ideas loft bed desk placement storage organization",
    createdDaysAgo: 3,
  },
  {
    title: "Winter Jacket — Return By Reminder",
    summary: "Personal note reminding to return the navy winter jacket if it doesn't fit, before the return window closes.",
    itemType: "note",
    category: "note",
    tags: ["reminder", "shopping"],
    rawText: "Return the navy winter jacket by the deadline if the fit is off — check the receipt for the exact date.",
    searchableText: "return reminder navy winter jacket deadline fit check",
    createdDaysAgo: 2,
  },
];

async function main() {
  console.log(`Seeding demo account (${DEMO_EMAIL})…`);

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  let demoUser = existingUsers.users.find((u) => u.email === DEMO_EMAIL);

  if (!demoUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: "Demo User" },
    });
    if (error || !data.user) throw new Error(`Failed to create demo user: ${error?.message}`);
    demoUser = data.user;
    console.log(`Created demo user ${demoUser.id}`);
  } else {
    console.log(`Reusing existing demo user ${demoUser.id}`);
  }

  const userId = demoUser.id;

  await supabase.from("profiles").upsert({
    id: userId,
    email: DEMO_EMAIL,
    display_name: "Demo User",
    plan: "pro",
    onboarding_completed: true,
    is_demo: true,
  });
  await supabase.from("user_settings").upsert({ user_id: userId });
  await supabase.from("subscriptions").upsert({ user_id: userId, plan: "pro", status: "active" });

  // Clean slate: remove any previously seeded items for idempotent re-runs.
  await supabase.from("items").delete().eq("user_id", userId);

  const collectionsByName = new Map<string, string>();
  for (const name of ["Miami Trip", "Car Mods", "Japan"]) {
    const { data: existing } = await supabase.from("collections").select("id").eq("user_id", userId).eq("name", name).maybeSingle();
    if (existing) {
      collectionsByName.set(name, existing.id);
    } else {
      const { data } = await supabase.from("collections").insert({ user_id: userId, name }).select("id").single();
      if (data) collectionsByName.set(name, data.id);
    }
  }

  for (const seed of SEED_ITEMS) {
    const createdAt = new Date(Date.now() - seed.createdDaysAgo * 24 * 60 * 60 * 1000).toISOString();

    const { data: item, error } = await supabase
      .from("items")
      .insert({
        user_id: userId,
        title: seed.title,
        summary: seed.summary,
        item_type: seed.itemType,
        content_category: seed.category as Database["public"]["Tables"]["items"]["Row"]["content_category"],
        source_url: seed.sourceUrl ?? null,
        source_domain: seed.sourceDomain ?? null,
        raw_text: seed.rawText,
        searchable_text: seed.searchableText,
        ai_analysis: {
          title: seed.title,
          summary: seed.summary,
          contentType: seed.category,
          tags: seed.tags,
          entities: { people: [], organizations: [], places: [], products: [], brands: [], dates: [], prices: [] },
          searchableText: seed.searchableText,
          suggestedCollections: [],
          confidence: 0.95,
        },
        processing_status: "completed",
        is_favorite: seed.isFavorite ?? false,
        created_at: createdAt,
        updated_at: createdAt,
      })
      .select("id")
      .single();

    if (error || !item) { console.error(`Failed to insert "${seed.title}"`, error); continue; }

    for (const tagName of seed.tags) {
      const normalized = tagName.toLowerCase().replace(/\s+/g, "-");
      const { data: tag } = await supabase
        .from("tags")
        .upsert({ user_id: userId, name: tagName, normalized_name: normalized }, { onConflict: "user_id,normalized_name" })
        .select("id")
        .single();
      if (tag) await supabase.from("item_tags").upsert({ item_id: item.id, tag_id: tag.id });
    }

    const chunks = chunkText(`${seed.title}\n${seed.summary}\n${seed.searchableText}`);
    const vectors = await generateEmbeddings(chunks.length ? chunks : [seed.searchableText]);
    await supabase.from("item_embeddings").insert(
      vectors.map((embedding, i) => ({ item_id: item.id, user_id: userId, content: chunks[i] ?? seed.searchableText, embedding, chunk_index: i }))
    );

    if (seed.receipt) {
      const purchaseDate = new Date(Date.now() - seed.receipt.purchaseDaysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const returnDeadline = seed.receipt.returnInDays !== null
        ? new Date(Date.now() + seed.receipt.returnInDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : null;
      await supabase.from("receipts").insert({
        item_id: item.id,
        user_id: userId,
        merchant: seed.receipt.merchant,
        purchase_date: purchaseDate,
        total: seed.receipt.total,
        currency: "USD",
        order_number: seed.receipt.orderNumber,
        return_deadline: returnDeadline,
        return_deadline_source: returnDeadline ? "extracted" : "none",
        return_status: returnDeadline ? "open" : "not_applicable",
        extraction_confidence: 0.92,
      });
    }

    for (const [name, collectionId] of collectionsByName) {
      if ((name === "Miami Trip" && seed.tags.includes("miami")) ||
          (name === "Car Mods" && seed.tags.includes("car mods")) ||
          (name === "Japan" && seed.tags.includes("japan"))) {
        await supabase.from("collection_items").upsert({ collection_id: collectionId, item_id: item.id });
      }
    }

    console.log(`Seeded: ${seed.title}`);
  }

  console.log("\nDone. Demo credentials:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
