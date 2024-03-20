const AV = require("leanengine");

/**
 * 限制最大点赞数 = 1
 * 限制只能点或踩一次
 */
AV.Cloud.beforeUpdate("Reviews", async function (request) {
  console.log("Review: beforeUpdate");

  const theUser = request.user || request.currentUser;
  console.log("userId: " + JSON.stringify(theUser));

  // if (!theUser) throw new AV.Cloud.Error("Invalid user!");

  const updatedKeys = request.object.updatedKeys;
  // JSON.stringify(updatedKeys);
  const isVoting =
    updatedKeys.includes("upVote") || updatedKeys.includes("downVote");
  if (!isVoting) return;

  console.log("Attempts updating vote");
  const currReviewId = request.object.id;
  console.log("currReviewId", currReviewId);

  const theReview = await new AV.Query("Reviews").get(currReviewId);
  const preUpVote = theReview.get("upVote");
  const currUpVote = request.object.get("upVote");
  const preDownVote = theReview.get("downVote");
  const currDownVote = request.object.get("downVote");

  console.log("preUpVote", preUpVote);
  console.log("currUpVote", currUpVote);
  console.log("preDownVote", preDownVote);
  console.log("currDownVote", currDownVote);

  // 限制最大点赞数 = 1
  const isValidUpVote = Math.abs(currUpVote - preUpVote) === 1;
  const isValidDownVote = Math.abs(currDownVote - preDownVote) === 1;

  const isValidUpdateStep =
    (currUpVote !== preUpVote && isValidUpVote) ||
    (currDownVote !== preDownVote && isValidDownVote);

  if (!isValidUpdateStep) {
    console.log("vote update error: must vote with increment/decrement 1");
    throw new AV.Cloud.Error(
      JSON.stringify({
        code: 403,
        message: "一次只能点赞/踩一下",
      })
    );
  }

  // 限制只能点或踩一次
  const currLikedReviews = theUser.get("likedReviewsNew") || [];
  const currDislikedReviews = theUser.get("dislikedReviewsNew") || [];
  console.log("currLikedReviews", JSON.stringify(currLikedReviews));
  console.log("currDislikedReviews", JSON.stringify(currDislikedReviews));

  const upVotedBefore = currLikedReviews.includes(currReviewId);
  const downVotedBefore = currDislikedReviews.includes(currReviewId);
  const isDuplicateVote =
    (isValidUpVote && downVotedBefore) || (isValidDownVote && upVotedBefore);
  if (isDuplicateVote) {
    console.log("vote update error: user has voted before!");
    throw new AV.Cloud.Error(
      JSON.stringify({
        code: 403,
        message: "vote update error: user has voted before!",
      })
    );
  }

  // update voting records
  console.log("action: upvoting");
  if (isValidUpVote && !upVotedBefore)
    theUser.addUnique("likedReviewsNew", currReviewId);
  if (isValidUpVote && upVotedBefore)
    theUser.remove("likedReviewsNew", currReviewId);

  console.log("action: downvote");
  if (isValidDownVote && !downVotedBefore)
    theUser.addUnique("dislikedReviewsNew", currReviewId);
  if (isValidDownVote && downVotedBefore)
    theUser.remove("dislikedReviewsNew", currReviewId);

  await theUser.save();
  console.log("update success");
});
