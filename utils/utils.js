export function formatTime(ms) {
  //round to milliseconds, no micro or nano
  ms = Math.round(ms)
  //correct units
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  //modulo
  ms = ms % 1000
  s = s % 60
  let paddedMs = ms.toString().padStart(3, "0")
  let paddedS = s.toString().padStart(2, "0")
  let paddedM = m.toString().padStart(2, "0")
  return `${paddedM}:${paddedS}.${paddedMs}`
}

export function removeFormattingCodes(text) {
  return text.replace(/§./g, "")
}

let chars = "abcdefghijklmnopqrstuvwxyz0123456789"
export function randomString(length) {
  let string = ""
  for (let i = 0; i < length; i++) {
    string += chars[Math.floor(Math.random() * chars.length)]
  }
  return string
}

export function random64BitBigInt() {
  // Generate two random 32-bit integers
  let upperInt = Math.floor(Math.random() * 0x80000000);
  let lowerInt = Math.floor(Math.random() * 0x100000000);

  // Combine them into a 64-bit BigInt
  let combinedInt = BigInt(upperInt) << 32n | BigInt(lowerInt);

  // Convert it into a signed 64-bit BigInt
  let isSigned = Math.random() < 0.5
  if (isSigned) {
    combinedInt -= (1n << 63n)
  }

  return combinedInt;
}