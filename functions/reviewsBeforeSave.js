const AV = require("leanengine");

/**
 * 限制点评数
 */
AV.Cloud.beforeSave("Reviews", async function (request) {
  console.log("Review: before save");
  const object = request.object;

  if (!request.currentUser) throw new AV.Cloud.Error("Invalid user!");

  const courseId = object.get("courseId");
  const authorId = object.get("authorId");

  console.log("courseId: " + JSON.stringify(courseId));
  console.log("authorId: " + JSON.stringify(authorId));
  console.log("userId: " + JSON.stringify(request.currentUser));

  const query = new AV.Query("Reviews");
  query.equalTo("authorId", authorId);
  query.equalTo("courseId", courseId);

  const reviews = await query.find();

  if (reviews.length > 0) {
    console.log("找到多个点评过的课程: " + results.length);
    throw new AV.Cloud.Error(
      JSON.stringify({
        code: 401,
        message: "不能重复点评同一位老师的课程",
      })
    );
  }
});
