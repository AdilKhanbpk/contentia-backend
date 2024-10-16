class CashoutModel {
    constructor(unique_id, name_surname, iban, name_of_bank, amount, currency, id_tc_kn, gsm_number, description) {
      this.unique_id = unique_id;
      this.name_surname = name_surname;
      this.iban = iban;
      this.name_of_bank = name_of_bank;
      this.amount = amount;
      this.currency = currency;
      this.id_tc_kn = id_tc_kn;
      this.gsm_number = gsm_number;
      this.description = description;
    }
  
    isValid() {
      // Validate the required fields before sending the data to the service
      return this.unique_id && this.name_surname && this.iban && this.amount && this.currency && this.id_tc_kn && this.gsm_number;
    }
  }
  
  module.exports = CashoutModel;
  