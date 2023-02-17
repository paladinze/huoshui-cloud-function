
const AV = require('leanengine')
const _ = require('lodash');

/**
 * Long-running job for updating courses
 */
AV.Cloud.define("jobBatchFixUserACL", async function (request) {

  const start = request.params.start;
  const end = request.params.end;
  const chunkSize = request.params.chunkSize || 50;

  if (start === undefined || end === undefined) {
    console.log('jobBatchFixUserACL: missing params');
    return;
  }

  console.log(`jobBatchFixUserACL: ${start} - ${end}, chunk size: ${chunkSize}`)

  const range = _.range(start, end);
  const chunks = _.chunk(range, chunkSize);

  async function traverseChunks() {
    for (let i = 0; i < chunks.length; ++i) {
      const chunk = chunks[i];
      const chunkStart = chunk[0];
      const chunkEnd = chunk[chunk.length - 1];

      console.log(`updating chunks: ${i + 1}/${chunks.length}: ${chunkStart} - ${chunkEnd}`)
      try {
        await AV.Cloud.run('updateBatchUserACL', {
          skip: chunk[0],
          limit: chunkSize
        });
        console.log(`update success`)
      } catch (e) {
        console.log('update fails', e);
      }
      await wait();
    }
  }
  traverseChunks();
  console.log('long-running job started');

});

function wait(delayMs = 5000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayMs);
  })
}
