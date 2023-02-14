const AV = require("leanengine");

/**
 * update course stats on review save
 */
/*----------------------------------------------------------------
Extract this review instance
-----------------------------------------------------------------*/
AV.Cloud.afterSave("Reviews", async function (request) {
  console.log("Reviews: after save");
  var srcData = {
    courseId: request.object.get("courseId").id,
    courseName: request.object.get("courseName"),
    profName: request.object.get("profName"),
    rate1: request.object.get("rating").rate1,
    rate2: request.object.get("rating").rate2,
    rate3: request.object.get("rating").rate3,
    rateOverall: request.object.get("rating").overall,

    bird: request.object.get("bird"),
    attendance: request.object.get("attendance"),
    homework: request.object.get("homework"),
    exam: request.object.get("exam"),

    tags: request.object.get("tags"),
    upVote: request.object.get("upVote"),
    downVote: request.object.get("downVote"),
  };

  /*----------------------------------------------------------------
Update corresponding course stats
-----------------------------------------------------------------*/

  const query = new AV.Query("Courses");
  const course = await query.get(srcData.courseId);

  //get existing data for the course
  const tgtData = {
    reviewCount: course.get("reviewCount") || 0,
    reviewGoodCount: course.get("reviewGoodCount") || 0,

    rateOverall: course.get("rateOverall") || 0,
    rate1: course.get("rate1") || 0,
    rate2: course.get("rate2") || 0,
    rate3: course.get("rate3") || 0,

    birdOverall: course.get("birdOverall") || 0,
    birdCount: course.get("birdCount") || 0,

    attendanceOverall: course.get("attendanceOverall") || 0,
    attendanceCount: course.get("attendanceCount") || 0,

    homeworkOverall: course.get("homeworkOverall") || 0,
    homeworkCount: course.get("homeworkCount") || 0,

    examOverall: course.get("examOverall") || 0,
    examCount: course.get("examCount") || 0,

    tags: course.get("tags"),
  };

  // update core rating
  console.log("update core rating");
  const rateOverall =
    (tgtData.rateOverall * tgtData.reviewCount + srcData.rateOverall / 3) /
    (tgtData.reviewCount + 1);
  const rate1 =
    (tgtData.rate1 * tgtData.reviewCount + srcData.rate1) /
    (tgtData.reviewCount + 1);
  const rate2 =
    (tgtData.rate2 * tgtData.reviewCount + srcData.rate2) /
    (tgtData.reviewCount + 1);
  const rate3 =
    (tgtData.rate3 * tgtData.reviewCount + srcData.rate3) /
    (tgtData.reviewCount + 1);

  course.increment("reviewCount");
  if (srcData.rateOverall > 11) {
    course.increment("reviewGoodCount");
  }
  course.set("rateOverall", rateOverall);
  course.set("rate1", rate1);
  course.set("rate2", rate2);
  course.set("rate3", rate3);

  // update secondary rating
  // bird
  console.log("update bird");
  if (srcData.bird && srcData.bird.value !== 0) {
    var birdOverall =
      (tgtData.birdOverall * tgtData.birdCount + srcData.bird.value) /
      (tgtData.birdCount + 1);
    course.increment("birdCount");
    course.set("birdOverall", birdOverall);
  }

  // attendance
  console.log("update attendance");
  if (srcData.attendance && srcData.attendance.value !== 0) {
    var attendanceOverall =
      (tgtData.attendanceOverall * tgtData.attendanceCount +
        srcData.attendance.value) /
      (tgtData.attendanceCount + 1);
    course.increment("attendanceCount");
    course.set("attendanceOverall", attendanceOverall);
  }

  // homework
  console.log("update homework");
  if (srcData.homework && srcData.homework.value !== 0) {
    var homeworkOverall =
      (tgtData.homeworkOverall * tgtData.homeworkCount +
        srcData.homework.value) /
      (tgtData.homeworkCount + 1);
    course.increment("homeworkCount");
    course.set("homeworkOverall", homeworkOverall);
  }

  // exam
  console.log("update exam");
  if (srcData.exam && srcData.exam.touched) {
    var examValue = 0;
    if (srcData.exam.examprep.checked) {
      examValue++;
    }
    if (srcData.exam.openbook.checked) {
      examValue++;
    }
    if (srcData.exam.oldquestion.checked) {
      examValue++;
    }
    if (srcData.exam.easiness.checked) {
      examValue++;
    }

    var examOverall =
      (tgtData.examOverall * tgtData.examCount + examValue) /
      (tgtData.examCount + 1);
    course.increment("examCount");
    course.set("examOverall", examOverall);
  }

  // tags
  console.log("update tags");
  var srcTagIds = [];
  for (var i = 0; i < srcData.tags.length; ++i) {
    srcTagId = parseInt(srcData.tags[i].id);
    srcTagIds.push(srcTagId);
    tgtData.tags[srcTagId]++;
  }
  course.set("tags", tgtData.tags);

  console.log("Course stats saved complete");
  return course.save();
});
