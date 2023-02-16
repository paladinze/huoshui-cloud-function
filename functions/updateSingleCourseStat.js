const AV = require('leanengine')

/**
 * Update stats of a single course
 */
AV.Cloud.define("updateSingleCourseStat", async function (request) {
  const courseId = request.params.courseId;

  if (!courseId) {
    console.log(`course ID incorrect: ${courseId}`);
    return;
  }

  console.log(`start course stats update: ${courseId}`);
  const courseQuery = new AV.Query("Courses");
  const course = await courseQuery.get(courseId);

  //get all related reviews
  const reviewQuery = new AV.Query("Reviews");
  reviewQuery.include("courseId");
  reviewQuery.equalTo("courseId", course);

  const reviews = await reviewQuery.find();

  console.log(`${course.get("name")} : ${course.get("prof")} : ${reviews.length} reviews`);

  if (reviews.length === 0) {
    console.log('no reviews to update');
    return;
  }

  const cmodel = {
    tags: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    reviewCount: 0,
    reviewGoodCount: 0,
    rate1: 0,
    rate2: 0,
    rate3: 0,
    rateOverall: 0,
    attendanceCount: 0,
    attendanceOverall: 0,
    homeworkCount: 0,
    homeworkOverall: 0,
    birdCount: 0,
    birdOverall: 0,
    examCount: 0,
    examOverall: 0,
  };

  // iterate through reviews and populate course model
  for (let j = 0; j < reviews.length; ++j) {
    const review = reviews[j];
    const rData = {
      rate1: review.get("rating").rate1,
      rate2: review.get("rating").rate2,
      rate3: review.get("rating").rate3,
      rateOverall: review.get("rating").overall,
      bird: review.get("bird"),
      attendance: review.get("attendance"),
      homework: review.get("homework"),
      exam: review.get("exam"),
      tags: review.get("tags"),
    };

    //review count
    cmodel.reviewCount++;
    if (rData.rateOverall > 11) {
      cmodel.reviewGoodCount++;
    }

    //rating
    cmodel.rateOverall += rData.rateOverall / 3;
    cmodel.rate1 += rData.rate1;
    cmodel.rate2 += rData.rate2;
    cmodel.rate3 += rData.rate3;

    //bird
    if (rData.brid && rData.bird.value !== 0) {
      cmodel.birdCount++;
      cmodel.birdOverall += rData.bird.value;
    }

    //attendance
    if (rData.attendance && rData.attendance.value !== 0) {
      cmodel.attendanceCount++;
      cmodel.attendanceOverall += rData.attendance.value;
    }

    //homework
    if (rData.homework && rData.homework.value !== 0) {
      cmodel.homeworkCount++;
      cmodel.homeworkOverall += rData.homework.value;
    }

    //exam
    if (rData.exam && rData.exam.touched) {
      let examValue = 0;
      if (rData.exam.examprep.checked) {
        examValue++;
      }
      if (rData.exam.openbook.checked) {
        examValue++;
      }
      if (rData.exam.oldquestion.checked) {
        examValue++;
      }
      if (rData.exam.easiness.checked) {
        examValue++;
      }
      cmodel.examCount++;
      cmodel.examOverall += examValue;
    }

    //tags
    var srcTagIds = [];
    for (var i = 0; i < rData.tags.length; ++i) {
      srcTagId = parseInt(rData.tags[i].id);
      srcTagIds.push(srcTagId);
      cmodel.tags[srcTagId]++;
    }
  } // end of review loop

  //normalize the stats
  if (cmodel.reviewCount > 0) {
    cmodel.rateOverall /= cmodel.reviewCount;
    cmodel.rate1 /= cmodel.reviewCount;
    cmodel.rate2 /= cmodel.reviewCount;
    cmodel.rate3 /= cmodel.reviewCount;
  }

  if (cmodel.birdCount) cmodel.birdOverall /= cmodel.birdCount;
  if (cmodel.attendanceCount)
    cmodel.attendanceOverall /= cmodel.attendanceCount;
  if (cmodel.homeworkCount)
    cmodel.homeworkOverall /= cmodel.homeworkCount;
  if (cmodel.examCount) cmodel.examOverall /= cmodel.examCount;
  console.log("overall" + cmodel.rateOverall);

  //save the course stats to database
  course.set("tags", cmodel.tags);
  course.set("reviewCount", cmodel.reviewCount);
  course.set("reviewGoodCount", cmodel.reviewGoodCount);
  course.set("rate1", cmodel.rate1);
  course.set("rate2", cmodel.rate2);
  course.set("rate3", cmodel.rate3);
  course.set("rateOverall", cmodel.rateOverall);
  course.set("attendanceCount", cmodel.attendanceCount);
  course.set("attendanceOverall", cmodel.attendanceOverall);
  course.set("homeworkCount", cmodel.homeworkCount);
  course.set("homeworkOverall", cmodel.homeworkOverall);
  course.set("birdCount", cmodel.birdCount);
  course.set("birdOverall", cmodel.birdOverall);
  course.set("examCount", cmodel.examCount);
  course.set("examOverall", cmodel.examOverall);
  return course.save();
});
