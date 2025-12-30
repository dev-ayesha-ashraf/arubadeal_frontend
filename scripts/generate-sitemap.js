// scripts/generate-sitemap.js
import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

// load .env
dotenv.config();

const BASE_URL = process.env.VITE_BASE_URL; 
const API_BASE = process.env.VITE_API_URL;  

async function fetchAllCars() {
  const size = 50;
  let page = 1;
  let totalPages = 1;
  const allCars = [];

  while (page <= totalPages) {
    const res = await axios.get(`${API_BASE}/car_listing/listing`, {
      params: { page, size }
    });

    const data = res.data;
    totalPages = data.total_pages;
    allCars.push(...data.items);
    page++;
  }

  return allCars;
}

function generateUrl(loc, changefreq, priority) {
  return `
  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap() {
  const cars = await fetchAllCars();

  const validCars = cars.filter(
    car =>
      car.is_active === true &&
      car.status === "Approved" &&
      car.is_sold === false
  );

  const makeSlugs = new Set();
  const typeSlugs = new Set();

  validCars.forEach(car => {
    if (car.make && car.make.slug) makeSlugs.add(car.make.slug);
    if (car.body_type && car.body_type.slug) typeSlugs.add(car.body_type.slug);
  });

  let urls = "";

  // Static pages
  urls += generateUrl(`${BASE_URL}/`, "daily", 1.0);
  urls += generateUrl(`${BASE_URL}/listings`, "daily", 0.8);
  urls += generateUrl(`${BASE_URL}/dealers`, "weekly", 0.7);
  urls += generateUrl(`${BASE_URL}/accessories`, "weekly", 0.7);
  urls += generateUrl(`${BASE_URL}/sellcar`, "monthly", 0.6);

  // Type pages
  typeSlugs.forEach(slug => {
    urls += generateUrl(`${BASE_URL}/types/${slug}`, "weekly", 0.8);
  });

  // Make pages (with query string)
  makeSlugs.forEach(slug => {
    urls += generateUrl(`${BASE_URL}/listings?makeSlug=${slug}`, "weekly", 0.8);
  });

  // Car detail pages
  validCars.forEach(car => {
    urls += generateUrl(`${BASE_URL}/listings/${car.slug}`, "daily", 0.9);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const outputPath = path.resolve("public", "sitemap.xml");
  fs.writeFileSync(outputPath, sitemap.trim());

  console.log("sitemap.xml generated successfully");
}

generateSitemap().catch(err => {
  console.error("Sitemap generation failed", err);
  process.exit(1);
});
