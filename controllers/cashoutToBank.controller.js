const { cashoutToBank } = require('../utils/cashoutService');
const CashoutModel = require('../models/cashoutToBank.model');

exports.cashoutToBankController = async (req, res) => {
  try {
    console.log('Cashout to bank request received:', req.body);

    const { cashoutData } = req.body;
    if (!cashoutData || !Array.isArray(cashoutData)) {
      console.error('Invalid or missing cashout data:', cashoutData);
      return res.status(400).json({ status: 'failure', message: 'Invalid cashout data format.' });
    }

    // Map the incoming data to instances of the CashoutModel class
    const cashoutModels = cashoutData.map(data => new CashoutModel(
      data.unique_id,
      data.name_surname,
      data.iban,
      data.name_of_bank,
      data.amount,
      data.currency,
      data.id_tc_kn,
      data.gsm_number,
      data.description
    ));

    console.log('Cashout models created:', cashoutModels);

    // Validate each cashout model
    for (const model of cashoutModels) {
      if (!model.isValid()) {
        console.error('Invalid cashout data found:', model);
        return res.status(400).json({ status: 'failure', message: 'Invalid cashout data.', invalidData: model });
      }
    }

    // Log validated data before sending it to the service
    console.log('All cashout models are valid. Sending data to cashout service...');

    // Call the service to process the cashout
    const cashoutResponse = await cashoutToBank(cashoutModels);
    console.log('Response received from cashout service:', cashoutResponse);

    // Check response status and send appropriate response to client
    if (cashoutResponse && cashoutResponse.status_code === 100) {
      console.log('Cashout to bank processed successfully:', cashoutResponse);
      return res.status(200).json({
        status: 'success',
        message: 'Cashout to bank processed successfully.',
        data: cashoutResponse,
      });
    } else {
      console.error('Cashout to bank failed:', cashoutResponse);
      return res.status(400).json({
        status: 'failure',
        message: 'Cashout to bank failed.',
        data: cashoutResponse,
      });
    }
  } catch (error) {
    console.error('Error during cashout to bank process:', error.message);
    res.status(500).json({ status: 'failure', message: 'Internal server error.', error: error.message });
  }
};
