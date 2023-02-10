const AV = require("leanengine");

/**
 * Update course stats on review delete
 */
/*----------------------------------------------------------------
Extract this review instance
-----------------------------------------------------------------*/
AV.Cloud.afterDelete("Reviews", async function (request) {
  console.log("Reviews afterDelete");
  const srcData = {
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
  query = new AV.Query("Courses");
  const course = await query.get(srcData.courseId);

  //get existing data for the course
  var tgtData = {
    reviewCount: course.get("reviewCount"),
    reviewGoodCount: course.get("reviewGoodCount"),

    rateOverall: course.get("rateOverall"),
    rate1: course.get("rate1"),
    rate2: course.get("rate2"),
    rate3: course.get("rate3"),

    birdOverall: course.get("birdOverall"),
    birdCount: course.get("birdCount"),

    attendanceOverall: course.get("attendanceOverall"),
    attendanceCount: course.get("attendanceCount"),

    homeworkOverall: course.get("homeworkOverall"),
    homeworkCount: course.get("homeworkCount"),

    examOverall: course.get("examOverall"),
    examCount: course.get("examCount"),

    tags: course.get("tags"),
  };

  console.log("update rating");
  if (tgtData.reviewCount === 1) {
    course.increment("reviewCount", -1);
    if (srcData.rateOverall > 11) {
      course.increment("reviewGoodCount", -1);
    }
    course.set("rateOverall", 0);
    course.set("rate1", 0);
    course.set("rate2", 0);
    course.set("rate3", 0);
  } else {
    var rateOverall =
      (tgtData.rateOverall * tgtData.reviewCount - srcData.rateOverall / 3) /
      (tgtData.reviewCount - 1);
    var rate1 =
      (tgtData.rate1 * tgtData.reviewCount - srcData.rate1) /
      (tgtData.reviewCount - 1);
    var rate2 =
      (tgtData.rate2 * tgtData.reviewCount - srcData.rate2) /
      (tgtData.reviewCount - 1);
    var rate3 =
      (tgtData.rate3 * tgtData.reviewCount - srcData.rate3) /
      (tgtData.reviewCount - 1);

    course.increment("reviewCount", -1);
    if (srcData.rateOverall > 11) {
      course.increment("reviewGoodCount", -1);
    }
    course.set("rateOverall", rateOverall);
    course.set("rate1", rate1);
    course.set("rate2", rate2);
    course.set("rate3", rate3);
  }

  //bird
  console.log("update bird");
  if (tgtData.birdCount === 1) {
    course.increment("birdCount", -1);
    course.set("birdOverall", 0);
  } else {
    if (srcData.bird && srcData.bird.value !== 0) {
      var birdOverall =
        (tgtData.birdOverall * tgtData.birdCount - srcData.bird.value) /
        (tgtData.birdCount - 1);
      course.increment("birdCount", -1);
      course.set("birdOverall", birdOverall);
    }
  }

  //attendance
  console.log("update attendance");
  if (tgtData.attendanceCount === 1) {
    course.increment("attendanceCount", -1);
    course.set("attendanceOverall", 0);
  } else {
    if (srcData.attendance && srcData.attendance.value !== 0) {
      var attendanceOverall =
        (tgtData.attendanceOverall * tgtData.attendanceCount -
          srcData.attendance.value) /
        (tgtData.attendanceCount - 1);
      course.increment("attendanceCount", -1);
      course.set("attendanceOverall", attendanceOverall);
    }
  }

  //homework
  console.log("update homework");
  if (tgtData.homeworkCount === 1) {
    course.increment("homeworkCount", -1);
    course.set("homeworkOverall", 0);
  } else {
    if (srcData.homework && srcData.homework.value !== 0) {
      var homeworkOverall =
        (tgtData.homeworkOverall * tgtData.homeworkCount -
          srcData.homework.value) /
        (tgtData.homeworkCount - 1);
      course.increment("homeworkCount", -1);
      course.set("homeworkOverall", homeworkOverall);
    }
  }

  //exam
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

    if (tgtData.examCount === 1) {
      course.increment("examCount", -1);
      course.set("examOverall", 0);
    } else {
      var examOverall =
        (tgtData.examOverall * tgtData.examCount - examValue) /
        (tgtData.examCount - 1);
      course.increment("examCount", -1);
      course.set("examOverall", examOverall);
    }
  }

  //tags
  console.log("update tags");
  var srcTagIds = [];
  for (var i = 0; i < srcData.tags.length; ++i) {
    srcTagId = parseInt(srcData.tags[i].id);
    srcTagIds.push(srcTagId);
    if (tgtData.tags[srcTagId] !== 0) {
      tgtData.tags[srcTagId]--;
    }
  }
  course.set("tags", tgtData.tags);

  await course.save();
  console.log("Reviews afterDelete: update sucess");
});
