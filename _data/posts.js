const request = require("sync-request");
const readingTime = require("reading-time");
const slugify = require("slugify");
const moment = require("moment");
const md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
});
require("dotenv").config();

var res = request(
  "GET",
  `https://potion-api.now.sh/table?id=${process.env.NOTION_API_TABLE}`,
  {
    headers: {
      "user-agent": "aboutdavid.me/1.0",
    },
  }
);
res = JSON.parse(res.getBody("utf8"));
res = res.filter((item) => item.fields.Published == true);
var posts = [];
var i = 0;
while (i < res.length) {
  var post = res[i];
  var html = request("GET", `https://potion-api.now.sh/html?id=${post.id}`, {
    headers: {
      "user-agent": "aboutdavid.me/1.0",
    },
  }).getBody("utf8");
  var date = new Date(post.fields.Date.start_date);
  var day = date.getDate();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var slug = slugify(`${year}-${month}-${day}-` + post.fields.Title).replace(
    ":",
    ""
  );
  posts.push({
    title: post.fields.Title,
    date: moment(date.toISOString()).format("MMMM Do[,] YYYY"),
    description: post.fields.Description || "",
    readTime: readingTime(html).text,
    slug: slug,
    html: md.render(html),
    url: `https://aboutdavid.me/post/${slug}`,
  });
  i++;
}
module.exports = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
