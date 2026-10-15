/**
 * configure-db.js
 * -----------------
 * Securely configure the MONGODB_URI in the .env file.
 *
 * This script:
 *   1. Reads the current .env file.
 *   2. Prompts you for your MongoDB Atlas database password using a HIDDEN
 *      input (the password is never echoed to the terminal and never sent
 *      to chat).
 *   3. URL-encodes the password (so special characters like @ : / # % ? work).
 *   4. Replaces the <db_password> placeholder in the MONGODB_URI line.
 *   5. Writes the updated .env back, preserving all other variables.
 *   6. Optionally verifies the connection to MongoDB Atlas.
 *
 * Usage:
 *   node configure-db.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_PATH = path.join(__dirname, '.env');

// URL-encode a password so special characters are safe in a connection string.
function urlEncodePassword(pw) {
    return encodeURIComponent(pw);
}

// Read the .env file into an array of lines.
function readEnv() {
    if (!fs.existsSync(ENV_PATH)) {
        console.error('ERROR: .env file not found at ' + ENV_PATH);
        process.exit(1);
    }
    return fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
}

// Prompt for a hidden password (no echo).
function promptHidden(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        // Mute the output so the password is not echoed.
        const stdin = process.stdin;
        const onData = (char) => {
            char = char + '';
            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    stdin.removeListener('data', onData);
                    break;
                default:
                    process.stdout.write('\x1b[2K\x1b[200D' + question + '*'.repeat(rl.line.length));
                    break;
            }
        };
        stdin.on('data', onData);
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    console.log('==============================================');
    console.log('  Rosé & Gold — MongoDB Atlas configuration');
    console.log('==============================================');
    console.log('');

    const lines = readEnv();

    // Find the MONGODB_URI line.
    const uriIndex = lines.findIndex((l) => l.startsWith('MONGODB_URI='));
    if (uriIndex === -1) {
        console.error('ERROR: MONGODB_URI not found in .env');
        process.exit(1);
    }

    const uriLine = lines[uriIndex];
    const uriValue = uriLine.slice('MONGODB_URI='.length);

    // Check if the placeholder is present.
    if (!uriValue.includes('<db_password>')) {
        console.log('The MONGODB_URI does not contain the <db_password> placeholder.');
        console.log('Current value: ' + uriValue);
        console.log('Nothing to replace. Exiting.');
        process.exit(0);
    }

    // Prompt for the password (hidden).
    const password = await promptHidden('Enter your MongoDB Atlas database password (hidden): ');
    if (!password) {
        console.error('\nERROR: No password entered. Exiting.');
        process.exit(1);
    }

    const encoded = urlEncodePassword(password);
    const newUri = uriValue.replace('<db_password>', encoded);

    // Update the line, preserving everything else.
    lines[uriIndex] = 'MONGODB_URI=' + newUri;

    // Write back to .env.
    fs.writeFileSync(ENV_PATH, lines.join('\n') + '\n', 'utf8');

    console.log('\n✅ MONGODB_URI updated successfully in .env');
    console.log('   (password was URL-encoded and stored locally — never shown)');
    console.log('');

    // Optional: verify the connection.
    const verify = await promptHidden('Verify the connection now? (y/n): ');
    if (verify.toLowerCase() === 'y' || verify.toLowerCase() === 'yes') {
        console.log('\nTesting connection to MongoDB Atlas...');
        try {
            const mongoose = require('mongoose');
            await mongoose.connect(newUri, {
                serverSelectionTimeoutMS: 10000,
                bufferCommands: false,
            });
            console.log('✅ MongoDB Connected: ' + mongoose.connection.host);
            await mongoose.disconnect();
        } catch (err) {
            console.error('❌ Connection failed: ' + err.message);
            console.log('   Check that the password is correct and your IP is whitelisted in Atlas.');
        }
    }

    console.log('\nDone. You can now start the backend with:  node server.js');
    process.exit(0);
}

main();