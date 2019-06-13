const axios = require('axios')

module.exports = {

  verify: async function(tokenFromUser) {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${tokenFromUser}`
    const response = await axios.post(url)

    return response.data.success
  }

}
