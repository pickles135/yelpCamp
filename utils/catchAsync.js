module.exports = func => { //exporting func
  return (req, res, next) => { //returns the params
    func(req, res, next).catch(next); //passes them into function then next
  }
}