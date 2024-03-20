const AV = require("leanengine");

/**
 * update course stats on review save
 */
/*----------------------------------------------------------------
Extract this review instance
-----------------------------------------------------------------*/
AV.Cloud.afterUpdate("Reviews", async function (request) {
  console.log("Reviews: after update");

  const prevReviewState = await request.object.fetch();
  const currReviewState = request.object;
  const updatedKeys = request.object.updatedKeys;
  if (!updatedKeys?.includes('approved')) {
    console.log('Not modifying approved field, skip review after update hook...');
    return;
  } 
  console.log("approval state - prev: " + prevReviewState.get('approved'))
  console.log("approval state - curr: " + currReviewState.get('approved'))

});
