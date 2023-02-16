const AV = require('leanengine')

/**
 * A simple cloud function.
 */
AV.Cloud.define("updateBatchCourseStats", async function (request) {
  const skip = request.params.skip || 0;
  const limit = request.params.limit || 100;

  console.log("updateBatchCourseStats: start course stats batch update");

  const courseQuery = new AV.Query("Courses");
  courseQuery.limit(limit);
  courseQuery.skip(skip);
  courseQuery.ascending('createdAt');
  const courses = await courseQuery.find();
  console.log("retrieved " + courses.length + " courses");

  if (courses.length === 0) {
    console.log('no course found');
    return
  }

  /*-----------------------------------------------------
    Iterate through courses and update stats
    ------------------------------------------------------*/
  for (let i = 0; i < courses.length; ++i) {
    let course = courses[i];
    console.log(`updating ${i+1}/${courses.length}: ${course.id} | ${course.get('name')} | ${course.get('prof')} | ${course.createdAt}`)
    try {
      await AV.Cloud.run('updateSingleCourseStat', {
        courseId: course.id
      });
      console.log(`update success: ${course.id}`)
    } catch (e) {
      console.log('update fails', e);
      throw new AV.Cloud.Error(
        JSON.stringify({
          code: 999,
          message: "update fails",
        })
      );
    }
  }
});
