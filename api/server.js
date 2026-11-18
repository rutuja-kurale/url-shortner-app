const express = require("express")
const cors = require("cors")
const urlRoutes = require("./routes/urlRoutes");
const { readUrls, writeUrls } = require("./utils/fileStore");


const app = express();
const PORT = 3002;

app.use(cors({
    origin: "http://localhost:4200"
}));

app.use(express.json())

app.use("/api", urlRoutes);
app.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urls = await readUrls();
    const foundUrl = urls.find((item) => item.short_code === shortCode);
    if (!foundUrl) {
      return res.status(404).json({ message: "Short URL not found." });
    }
    foundUrl.clicks = Number(foundUrl.clicks || 0) + 1;
    await writeUrls(urls);
    return res.redirect(foundUrl.original_url);
  } catch (err) {
    console.error("Error handling redirect:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
})