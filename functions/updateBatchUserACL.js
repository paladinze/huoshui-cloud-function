const AV = require('leanengine')

/**
 * A simple cloud function.
 */
AV.Cloud.define("updateBatchUserACL", async function (request) {
  const skip = request.params.skip || 0;
  const limit = request.params.limit || 100;

  console.log("updateBatchUserACL: start updating ACL");

  AV.Cloud.useMasterKey();
  const userQuery = new AV.Query("_User");
  userQuery.limit(limit);
  userQuery.skip(skip);
  userQuery.descending('createdAt');
  const users = await userQuery.find();
  console.log("retrieved " + users.length + " users");

  if (users.length === 0) {
    console.log('no users found');
    return
  }

  /*-----------------------------------------------------
    Iterate through users and update ACL
    ------------------------------------------------------*/
  for (let i = 0; i < users.length; ++i) {
    let user = users[i];
    console.log(`updating ${i + 1}/${users.length}: ${user.id} | ${user.get('username')} | ${user.get('email')} | ${user.createdAt}`)
    try {
      // const savedACL = user.getACL();
      // savedACL.setPublicReadAccess(true);
      // savedACL.setPublicWriteAccess(false);
      // savedACL.setWriteAccess(AV.User.current(), true);
      user.set('ACL', {"*": {"read": true}, [user.id]: {"write": true}})
      await user.save();

      console.log(`update success: ${user.id}`)
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
