
export class HelperAndFormatter {
  public static generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const parts = [];
    for (let i = 0; i < 3; i++) {
        let part = '';
        for (let j = 0; j < 3; j++) {
            part += chars[Math.floor(Math.random() * chars.length)];
        }
        parts.push(part);
    }
    return parts.join('-');
}
  public static formatName(name: string): string {
      let userName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const titles = [ "Mr.", "Mr ", "MR.", "Ms.", "MS.", "MRS.", "Mrs.", "MISS.", "Miss" ];
      for (const title of titles) {
          userName = userName.replace(new RegExp(`^${title}\\s+`, 'i'), '').trim();
      }
      const words = userName.split(' ');
      const formattedWords = words.map((word, index) => {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
      return formattedWords.join(' ');
  }


}




// create a random string with in using format 'xxx-xxx-xxx' using 'a-z' and '0-9' 
// export in ts for everyone use like class or method

// const ShortCodeGenerator = () => {
//     const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
//     const parts = [];
//     for (let i = 0; i < 3; i++) {
//         let part = '';
//         for (let j = 0; j < 3; j++) {
//             part += chars[Math.floor(Math.random() * chars.length)];
//         }
//         parts.push(part);
//     }
//     return parts.join('-');
// };









// const {createConnection} = require('mysql2');
// const {createConnection: createConnection2 } = require('mysql2/promise');
// const bluebird = require('bluebird');
// const moment = require('moment-timezone');



// // formatting 
// exports.formatName = (name) => {
//     let userName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
//     const titles = [ "Mr.", "Mr ", "MR.", "Ms.", "MS.", "MRS.", "Mrs.", "MISS.", "Miss" ];
//     for (const title of titles) {
//         userName = userName.replace(new RegExp(`^${title}\\s+`, 'i'), '').trim();
//     }
//     const words = userName.split(' ');
//     const formattedWords = words.map((word, index) => {
//             return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//     });
//     return formattedWords.join(' ');
// };

// exports.formatAddress = (address) => {
//     return  address
//     .replace(/[^a-zA-Z0-9\s,]/g, '-') // Replace special characters with '-'
//     .split(',') // Split on ','
//     .map(part => part.trim()) // Trim each part
//     .map(part => part.replace(/\b\w/g, char => char.toUpperCase())) // Capitalize each word
//     .join(', ') // Join with ', ';
//     .slice(0, 254);
// };

// exports.formatDob = (dob) => {
//     return dob ? (moment(dob).format('YYYY-MM-DD')): null;
// };

// exports.formatGender = (gender) => {
//     return gender ? (gender === 'Male') ? 'M' : (gender === 'Female')? 'F' : null : null;
// };

// exports.formatEmail = (email) => {
//     // trim 
//     // lowercase
//     // remove special chars except @ and . and _ and -
//     // remove spaces
//     // validate via regex
//     newEmail = email ? email.trim().toLowerCase().replace(/[^a-zA-Z0-9@._-]/g, '').replace(/\s/g, '') : null;
//     return newEmail;
    
// };

// exports.formatCoordinates = (lat,lng) => {
//     return lat && lng ? `ST_GeomFromText('POINT(${parseFloat(lng).toFixed(8)} ${parseFloat(lat).toFixed(8)})')`: null;
// };

// exports.getLatLng = (coordinates) => {
//     return 
// };


// mkdir jwt-rsa-encryption
// cd jwt-rsa-encryption
// npm init -y
// npm install express jsonwebtoken crypto --save


// openssl genrsa -out private.pem 2048
// openssl rsa -in private.pem -outform PEM -pubout -out public.pem
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const fs = require('fs');
// const crypto = require('crypto');

// const app = express();
// app.use(express.json());

// // Read the private RSA key
// const privateKey = fs.readFileSync('./private.pem', 'utf8');

// // Mock user data for the purpose of this example
// const users = [
//   { id: 1, username: 'user1', password: 'password1' },
//   { id: 2, username: 'user2', password: 'password2' }
// ];

// // Login route
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
  
//   // Validate user credentials
//   const user = users.find(u => u.username === username && u.password === password);
  
//   if (!user) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }
  
//   // Generate a JWT
//   const tokenPayload = {
//     id: user.id,
//     username: user.username
//   };

//   const token = jwt.sign(tokenPayload, 'mysecret', { expiresIn: '1h' });
  
//   // Encrypt the JWT using RSA private key
//   const encryptedToken = crypto.publicEncrypt(privateKey, Buffer.from(token));
  
//   res.json({ token: encryptedToken.toString('base64') });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// // Read the public RSA key
// const publicKey = fs.readFileSync('./public.pem', 'utf8');

// // Middleware to decrypt and verify JWT
// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization'];

//   if (!token) {
//     return res.status(403).json({ message: 'Token is required' });
//   }

//   try {
//     // Decode the encrypted JWT
//     const decryptedToken = crypto.privateDecrypt(publicKey, Buffer.from(token, 'base64')).toString('utf8');
    
//     // Verify the JWT
//     const decoded = jwt.verify(decryptedToken, 'mysecret');
    
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // Secure route
// app.get('/secure-data', verifyToken, (req, res) => {
//   res.json({ message: 'This is secure data', user: req.user });
// });
