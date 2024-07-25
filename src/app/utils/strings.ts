import { CNP } from 'romanian-personal-identity-code-validator';

export function generateRandomId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  }

  export function getCurrentYear(): number {
    const currentDate = new Date();
    return currentDate.getFullYear();
  }

  export function isValidRomanianLicensePlate(plateNumber: string): boolean {
    // Regular expressions for each valid format
    const bucharestBefore2007 = /^[B]\d{2}[A-Z]{3}$/;
    const bucharestAfter2007 = /^[B]\d{3}[A-Z]{3}$/;
    const standard = /^[A-Z]{2}\d{2}[A-Z]{3}$/;
    const temporaryShortTerm = /^[A-Z]{2}0\d{5}$/;
    const temporaryLongTerm = /^[B]\d{5}$/;
    const diplomatic = /^(CS|TC|CO)\d{6}$/;

    // Check which pattern matches the plate number
    if (bucharestBefore2007.test(plateNumber)) {
        return true;
    }
    if (bucharestAfter2007.test(plateNumber)) {
        return true;
    }
    if (standard.test(plateNumber)) {
        return true;
    }
    if (temporaryShortTerm.test(plateNumber)) {
        // Additional check for the last digit
        const lastDigit = plateNumber.charAt(7);
        if (lastDigit !== '0') {
            return true;
        }
    }
    if (temporaryLongTerm.test(plateNumber)) {
        return true;
    }
    if (diplomatic.test(plateNumber)) {
        return true;
    }

    // If no patterns match, return false
    return false;
}

export function capitalizeFirstLetter(input: string): string {
    if (input.length === 0) {
        return '';
    }

    const lowercased = input.toLowerCase();
    const capitalized = lowercased.charAt(0).toUpperCase() + lowercased.slice(1);

    return capitalized;
}

export function isCNPValid(value: string): boolean {
    let cnp = new CNP('CNP');
    cnp.cnp = value
    return cnp.isValid()
}
