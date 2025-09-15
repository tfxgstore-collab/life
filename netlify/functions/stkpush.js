const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { phone, amount } = JSON.parse(event.body);

    // Daraja credentials (store these in Netlify ENV variables later for security)
    const consumerKey = process.env.CONSUMER_KEY || "kp02OHIA2dLl3cHgeiy7ASgTBIeuH6DnNVUM8epx9OnbxLLB";
    const consumerSecret = process.env.CONSUMER_SECRET || "8BSdOKdGS5FECgHcXktaASCrdU6tD5naxBH7om0GApVrAFDOl9ipyIi1cIxKe87G";
    const shortcode = "174379"; // test Paybill
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    // 1. Generate access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenResponse.data.access_token;

    // 2. Generate timestamp & password
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    // 3. Make STK Push request
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://siato.netlify.app/.netlify/functions/callback",
        AccountReference: "TFXGStore",
        TransactionDesc: "Robot Purchase",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(stkResponse.data),
    };
  } catch (error) {
    console.error(error.response?.data || error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.response?.data || error.message }),
    };
  }
};
