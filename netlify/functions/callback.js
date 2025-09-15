exports.handler = async (event) => {
  try {
    console.log("M-Pesa Callback:", event.body);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Callback received", payload: event.body }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
