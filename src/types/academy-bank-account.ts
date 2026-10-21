export type AcademyBankAccount = {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string | null;
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  countryId: string;
  countryName: string;
  studentInstructions: string | null;
  isVisibleToStudents: boolean;
  creationTime: string;
};

export type AcademyBankAccountPayload = {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  currencyId: string;
  countryId: string;
  studentInstructions: string;
  isVisibleToStudents: boolean;
};
