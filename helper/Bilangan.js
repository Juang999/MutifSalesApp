class Bilangan {
    parse = (num) => {
        if (num === 0) return "nol";

        let result = "";
        let thousandCounter = 0;
    
        while (num > 0) {
            let chunk = num % 1000;
            if (chunk > 0) {
                result = this.getWords(chunk) + " " + this.words.thousands[thousandCounter] + " " + result;
            }
            num = Math.floor(num / 1000);
            thousandCounter++;
        }
    
        let resultWord = result.trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') + ' Rupiah';

        return resultWord
    }

    words = {
        units: ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"],
        teens: ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"],
        tens: ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"],
        thousands: ["", "ribu", "juta", "miliar", "triliun"]
    }

    getWords = (n) => {
        let result = "";
        if (n > 99) {
            result += (Math.floor(n / 100) == 1) ? ' seratus ' : this.words.units[Math.floor(n / 100)] + " ratus ";
            n %= 100;
        }
        if (n > 19) {
            result += this.words.tens[Math.floor(n / 10)] + " ";
            n %= 10;
        } else if (n > 9) {
            result += this.words.teens[n - 10] + " ";
            n = 0;
        }
        if (n > 0) {
            result += this.words.units[n] + " ";
        }
        return result.trim();
    }
}

module.exports = new Bilangan();
