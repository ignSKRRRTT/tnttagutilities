//somewhere in the megabytes of dependencies something is using the old Buffer() constructor, which sends a warning in console to anyone who uses this
//these couple lines of code disable that
const warning = process.emitWarning;
process.emitWarning = function(...args) {
  if (args[2] !== 'DEP0005') return warning.apply(process, args)
}