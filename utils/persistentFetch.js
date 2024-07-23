import fetch from "node-fetch"

//an exposed and internal function are used here to prevent recursion, promises won't self-contain if errors continue to occur

export function persistentFetch(url, options, attempts = 3) {
  return new Promise(async (resolve, reject) => {
    doInternalFetch(url, options, attempts, resolve, reject)
  })
}

async function doInternalFetch(url, options, attemptsRemaining, resolve, reject) {
  try {
    let res = await fetch(url, options)
    if (res.ok) {
      resolve(res)
    } else {
      if (attemptsRemaining > 0) {
        doInternalFetch(url, options, attemptsRemaining - 1, resolve, reject)
      } else {
        reject(res)
      }
    }
  } catch (error) {
    if (attemptsRemaining > 0) {
      doInternalFetch(url, options, attemptsRemaining - 1, resolve, reject)
    } else {
      reject(error)
    }
  }
}