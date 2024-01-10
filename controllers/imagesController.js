require(`dotenv`).config();
const cloudinary = require("cloudinary").v2;
const puppeteer = require(`puppeteer`);
const JSZip = require("jszip");
const zip = new JSZip();

const deleteImage = async (req, res) => {
  cloudinary.config({
    cloud_name: "fancreate",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  try {
    const { imageId } = req.body;
    const deleted = await cloudinary.uploader.destroy(imageId);
    res.status(200).json({ message: `Image deleted successfully: ${deleted}` });
  } catch (error) {
    res.status(500).json({ message: `Error deleting image: ${error}` });
  }
};

const deliverChatScreenshot = async (req, res) => {
  const { html } = req.body;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  let isEndOfPage = false;
  let ssIndex = 0;

  while (!isEndOfPage) {
    const ssBuffer = await page.screenshot();
    zip.file(`screenshot_${ssIndex}.png`, ssBuffer);
    isEndOfPage = await page.evaluate(() => {
      const scrolled = window.scrollBy(0, window.innerHeight);
      return window.innerHeight + window.scrollY >= document.body.offsetHeight;
    });
    ssIndex++;
  }
  await browser.close();
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  res.type("application/zip").send(zipBuffer);
};

module.exports = {
  deleteImage,
  deliverChatScreenshot,
};
